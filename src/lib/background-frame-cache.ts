type DecodedFrame = {
  image: ImageBitmap | HTMLImageElement;
  width: number;
  height: number;
};

const DECODED_BYTE_BUDGET = 48 * 1024 * 1024;
const LOAD_CONCURRENCY = 4;
const DECODE_CONCURRENCY = 2;
const NEARBY_FRAMES = 8;

/** Keep small compressed files, but only a bounded working set of decoded pixels. */
export class BackgroundFrameCache {
  private blobs = new Map<number, Blob>();
  private decoded = new Map<number, DecodedFrame>();
  private requests = new Map<number, AbortController>();
  private decoding = new Set<number>();
  private failures = new Set<number>();
  private objectUrls = new Map<HTMLImageElement, { url: string; reject: (reason: Error) => void }>();
  private stale = new Set<number>();
  private priorities: number[] = [0];
  private cursor = 0;
  private target = 0;
  private displayed = -1;
  private disposed = false;
  private paused = false;
  private staticMode = false;
  private width = 1;
  private height = 1;
  private sourceWidth = 0;
  private sourceHeight = 0;

  constructor(
    private readonly urls: readonly string[],
    private readonly onReady: () => void,
  ) {}

  get loadedCount() {
    return this.blobs.size;
  }

  setViewport(width: number, height: number) {
    this.width = width;
    this.height = height;
    if (!this.sourceWidth) return;
    const scale = Math.min(1, Math.max(width / this.sourceWidth, height / this.sourceHeight));
    for (const [index, frame] of this.decoded) {
      if (frame.width + 1 >= this.sourceWidth * scale) continue;
      if (index === this.displayed) this.stale.add(index);
      else {
        this.release(frame.image);
        this.decoded.delete(index);
      }
    }
  }

  prioritize(target: number, direction: number) {
    if (this.staticMode) target = 0;
    this.target = target;
    const order = [target, 0];
    for (let distance = 1; !this.staticMode && distance <= NEARBY_FRAMES; distance++) {
      order.push(target + distance * direction, target - distance * direction);
    }
    this.priorities = [...new Set(order)].filter((index) => index >= 0 && index < this.urls.length);
    this.pump();
  }

  /** Reduced motion needs one still image, with no sequence prefetching. */
  setStaticMode(enabled: boolean) {
    this.staticMode = enabled;
    if (enabled) this.prioritize(0, 1);
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    if (!paused) this.pump();
  }

  nearest(index: number): { index: number; frame: DecodedFrame } | undefined {
    let nearestIndex = -1;
    let distance = Infinity;
    for (const key of this.decoded.keys()) {
      const nextDistance = Math.abs(key - index);
      if (nextDistance < distance) {
        nearestIndex = key;
        distance = nextDistance;
      }
    }
    const frame = this.decoded.get(nearestIndex);
    return frame ? { index: nearestIndex, frame } : undefined;
  }

  markDisplayed(index: number) {
    this.displayed = index;
    this.evict();
  }

  private pump() {
    if (this.disposed || this.paused) return;

    // Leave room for the displayed fallback, even when it is far from the new target.
    // Limiting the decode set prevents evict/redecode churn when the budget is full.
    for (const index of this.decodePriorities()) {
      if (this.decoding.size >= DECODE_CONCURRENCY) break;
      const blob = this.blobs.get(index);
      if (blob && (!this.decoded.has(index) || this.stale.has(index)) && !this.decoding.has(index)) {
        this.decoding.add(index);
        void this.decode(index, blob);
      }
    }

    while (this.requests.size < LOAD_CONCURRENCY) {
      let index = this.priorities.find((candidate) => this.needsLoad(candidate));
      if (index === undefined) {
        if (this.staticMode) break;
        while (this.cursor < this.urls.length && !this.needsLoad(this.cursor)) this.cursor++;
        if (this.cursor >= this.urls.length) break;
        index = this.cursor++;
      }
      const controller = new AbortController();
      this.requests.set(index, controller);
      void this.load(index, controller);
    }
  }

  private needsLoad(index: number) {
    return !this.blobs.has(index) && !this.requests.has(index) && !this.failures.has(index);
  }

  private async load(index: number, controller: AbortController) {
    try {
      const response = await fetch(this.urls[index], {
        signal: controller.signal,
        cache: "force-cache",
      });
      if (!response.ok) throw new Error(`Background frame returned ${response.status}`);
      const blob = await response.blob();
      if (!this.disposed) this.blobs.set(index, blob);
    } catch {
      if (!this.disposed) this.failures.add(index);
    } finally {
      this.requests.delete(index);
      if (!this.disposed) {
        this.pump();
        this.onReady();
      }
    }
  }

  private async decode(index: number, blob: Blob) {
    let image: ImageBitmap | HTMLImageElement | undefined;
    try {
      if (typeof createImageBitmap === "function") {
        // Decode no larger than necessary; browsers do the work outside the scroll handler.
        const scale = this.sourceWidth
          ? Math.min(1, Math.max(this.width / this.sourceWidth, this.height / this.sourceHeight))
          : 1;
        const options: ImageBitmapOptions = this.sourceWidth
          ? {
              resizeWidth: Math.max(1, Math.round(this.sourceWidth * scale)),
              resizeHeight: Math.max(1, Math.round(this.sourceHeight * scale)),
              resizeQuality: "medium",
            }
          : {};
        try {
          image = await createImageBitmap(blob, options);
        } catch {
          if (this.disposed) return;
          // Safari versions with partial bitmap support can still decode an ordinary image.
          image = await this.decodeImage(blob);
        }
      } else {
        image = await this.decodeImage(blob);
      }
      if (this.disposed) {
        this.release(image);
        return;
      }
      const width = image instanceof HTMLImageElement ? image.naturalWidth : image.width;
      const height = image instanceof HTMLImageElement ? image.naturalHeight : image.height;
      if (!width || !height) throw new Error("Empty background frame");
      if (!this.sourceWidth) {
        this.sourceWidth = width;
        this.sourceHeight = height;
      }
      const previous = this.decoded.get(index);
      if (previous) this.release(previous.image);
      this.stale.delete(index);
      // A viewport can grow while an asynchronous resize/decode is in progress.
      const requiredScale = Math.min(1, Math.max(this.width / this.sourceWidth, this.height / this.sourceHeight));
      if (width + 1 < this.sourceWidth * requiredScale) this.stale.add(index);
      this.decoded.set(index, { image, width, height });
      this.evict();
      this.onReady();
    } catch {
      if (image) this.release(image);
      if (!this.disposed) {
        this.failures.add(index);
        this.blobs.delete(index);
      }
    } finally {
      this.decoding.delete(index);
      if (!this.disposed) this.pump();
    }
  }

  private decodeImage(blob: Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const url = URL.createObjectURL(blob);
      this.objectUrls.set(image, { url, reject });
      image.decoding = "async";
      image.onload = () => {
        image.onload = null;
        image.onerror = null;
        URL.revokeObjectURL(url);
        this.objectUrls.delete(image);
        resolve(image);
      };
      image.onerror = () => {
        this.release(image);
        reject(new Error("Invalid background image"));
      };
      image.src = url;
    });
  }

  private evict() {
    let bytes = 0;
    for (const frame of this.decoded.values()) bytes += frame.width * frame.height * 4;
    const wanted = new Set(this.decodePriorities());
    const candidates = [...this.decoded.keys()]
      .filter((index) => index !== this.displayed && index !== this.target)
      .sort((a, b) => Number(wanted.has(a)) - Number(wanted.has(b)) ||
        Math.abs(b - this.target) - Math.abs(a - this.target));
    for (const index of candidates) {
      if (bytes <= DECODED_BYTE_BUDGET) break;
      const frame = this.decoded.get(index)!;
      bytes -= frame.width * frame.height * 4;
      this.release(frame.image);
      this.decoded.delete(index);
    }
  }

  private decodePriorities() {
    const capacity = this.sourceWidth
      ? Math.max(1, Math.floor(DECODED_BYTE_BUDGET / (this.sourceWidth * this.sourceHeight * 4)) - 1)
      : 2;
    return this.priorities.slice(0, capacity);
  }

  private release(image: ImageBitmap | HTMLImageElement) {
    if (image instanceof HTMLImageElement) {
      image.onload = null;
      image.onerror = null;
      const pending = this.objectUrls.get(image);
      if (pending) {
        URL.revokeObjectURL(pending.url);
        pending.reject(new Error("Background image cancelled"));
      }
      this.objectUrls.delete(image);
      image.removeAttribute("src");
    } else {
      image.close();
    }
  }

  dispose() {
    this.disposed = true;
    for (const controller of this.requests.values()) controller.abort();
    for (const frame of this.decoded.values()) this.release(frame.image);
    for (const image of this.objectUrls.keys()) this.release(image);
    this.requests.clear();
    this.decoding.clear();
    this.decoded.clear();
    this.blobs.clear();
    this.failures.clear();
    this.stale.clear();
    this.priorities = [];
  }
}
