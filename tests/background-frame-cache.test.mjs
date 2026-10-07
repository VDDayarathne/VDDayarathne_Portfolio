import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import test from "node:test";
import vm from "node:vm";

const source = await readFile(new URL("../src/lib/background-frame-cache.ts", import.meta.url), "utf8");
const cacheScript = new vm.Script(
  stripTypeScriptTypes(source, { mode: "transform" }).replace("export class BackgroundFrameCache", "class BackgroundFrameCache")
    + "\nBackgroundFrameCache;",
);
const flush = () => new Promise((resolve) => setImmediate(resolve));

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

// Each fixture runs browser-facing code in its own realm with controlled network
// and decoder completion. No DOM globals are changed for the other test files.
function fixture({ count = 30, autoLoad = true, bitmap = true, missing = [] } = {}) {
  const urls = Array.from({ length: count }, (_, index) => `/frames/${index}.jpg`);
  const fetches = [];
  const decodes = [];
  const bitmaps = [];
  const images = [];
  const objectUrls = new Map();
  const revoked = [];
  let activeFetches = 0;
  let maximumFetches = 0;
  let maximumDecodes = 0;
  let readyCalls = 0;

  class FakeImage {
    constructor() { images.push(this); }
    naturalWidth = 0;
    naturalHeight = 0;
    onload = null;
    onerror = null;
    src = "";
    removeAttribute(name) { if (name === "src") this.src = ""; }
  }

  const context = vm.createContext({
    AbortController,
    HTMLImageElement: FakeImage,
    Image: FakeImage,
    URL: {
      createObjectURL(blob) {
        const url = `blob:fixture-${objectUrls.size}-${images.length}`;
        objectUrls.set(url, blob);
        return url;
      },
      revokeObjectURL(url) { objectUrls.delete(url); revoked.push(url); },
    },
    fetch(url, { signal }) {
      const index = urls.indexOf(url);
      const pending = deferred();
      const record = { index, signal, pending };
      fetches.push(record);
      activeFetches++;
      maximumFetches = Math.max(maximumFetches, activeFetches);
      const abort = () => pending.reject(new Error("Aborted"));
      signal.addEventListener("abort", abort, { once: true });
      if (autoLoad) pending.resolve();
      return pending.promise.then(() => ({
        ok: !missing.includes(index),
        status: missing.includes(index) ? 404 : 200,
        blob: async () => ({ index }),
      })).finally(() => {
        activeFetches--;
        signal.removeEventListener("abort", abort);
      });
    },
    createImageBitmap: bitmap ? (blob, options) => {
      const pending = deferred();
      const record = { index: blob.index, options, pending, settled: false };
      decodes.push(record);
      maximumDecodes = Math.max(maximumDecodes, decodes.filter((item) => !item.settled).length);
      return pending.promise;
    } : undefined,
  });

  const BackgroundFrameCache = cacheScript.runInContext(context);
  const cache = new BackgroundFrameCache(urls, () => { readyCalls++; });

  function finishBitmap(record, width = 1280, height = 720) {
    assert(!record.settled, "Bitmap decoder should complete only once");
    record.settled = true;
    const image = {
      width: record.options.resizeWidth ?? width,
      height: record.options.resizeHeight ?? height,
      closed: 0,
      close() { this.closed++; },
    };
    bitmaps.push(image);
    record.pending.resolve(image);
    return image;
  }

  function failBitmap(record) {
    record.settled = true;
    record.pending.reject(new Error("Decoder rejected the frame"));
  }

  function finishImage(image, width = 1280, height = 720) {
    image.naturalWidth = width;
    image.naturalHeight = height;
    assert.equal(typeof image.onload, "function");
    image.onload();
  }

  async function settleBitmaps(width = 1280, height = 720) {
    for (let attempt = 0; attempt < 60; attempt++) {
      await flush();
      const pending = decodes.filter((item) => !item.settled);
      if (!pending.length) return;
      for (const record of pending) finishBitmap(record, width, height);
    }
    assert.fail("Decoder never becomes idle; frames may be repeatedly evicted and decoded");
  }

  return {
    cache, fetches, decodes, bitmaps, images, objectUrls, revoked,
    finishBitmap, failBitmap, finishImage, settleBitmaps,
    get readyCalls() { return readyCalls; },
    get maximumFetches() { return maximumFetches; },
    get maximumDecodes() { return maximumDecodes; },
  };
}

test("loads each compressed frame once with bounded network and decoder concurrency", async (t) => {
  const f = fixture();
  t.after(() => f.cache.dispose());
  f.cache.setViewport(1280, 720);
  f.cache.prioritize(19, -1);
  await f.settleBitmaps();

  assert.equal(f.cache.loadedCount, 30);
  assert.equal(f.fetches.length, 30);
  assert.equal(new Set(f.fetches.map(({ index }) => index)).size, 30);
  assert(f.maximumFetches <= 4);
  assert(f.maximumDecodes <= 2);
  assert.equal(f.cache.nearest(19)?.index, 19);
  assert(f.cache.nearest(29), "A loaded nearby frame should provide a drawable fallback");
});

test("reduced motion loads only the still frame and can resume the full sequence", async (t) => {
  const f = fixture();
  t.after(() => f.cache.dispose());
  f.cache.setViewport(1280, 720);
  f.cache.setStaticMode(true);
  f.cache.prioritize(19, -1);
  await f.settleBitmaps();

  assert.deepEqual(f.fetches.map(({ index }) => index), [0]);
  assert.deepEqual(f.decodes.map(({ index }) => index), [0]);
  assert.equal(f.cache.loadedCount, 1);
  assert.equal(f.cache.nearest(0)?.index, 0);

  f.cache.setStaticMode(false);
  f.cache.prioritize(19, -1);
  await f.settleBitmaps();
  assert.equal(f.cache.loadedCount, 30);
  assert.equal(f.cache.nearest(19)?.index, 19);
  assert.equal(f.fetches.filter(({ index }) => index === 0).length, 1);
});

test("the decoded working set becomes idle within its budget while retaining the displayed fallback", async (t) => {
  for (const [width, height] of [[1280, 720], [2048, 1536]]) {
    await t.test(`${width} by ${height} frames`, async (t) => {
      const f = fixture({ count: 80 });
      t.after(() => f.cache.dispose());
      f.cache.setViewport(width, height);
      f.cache.prioritize(30, 1);
      await f.settleBitmaps(width, height);
      f.cache.markDisplayed(30);

      const displayed = f.cache.nearest(30).frame.image;
      f.cache.prioritize(70, -1);
      assert.equal(f.cache.nearest(30).frame.image, displayed);
      assert.equal(displayed.closed, 0);
      await f.settleBitmaps(width, height);

      const decodeCount = f.decodes.length;
      for (let attempt = 0; attempt < 5; attempt++) {
        f.cache.prioritize(70, -1);
        await flush();
      }
      assert.equal(f.decodes.length, decodeCount, "Idle priorities must not restart decoder work");
      const retainedBytes = f.bitmaps.filter((image) => !image.closed)
        .reduce((bytes, image) => bytes + image.width * image.height * 4, 0);
      assert(retainedBytes <= 48 * 1024 * 1024);
      assert.equal(displayed.closed, 0);
      assert.equal(f.cache.nearest(70)?.index, 70);
    });
  }
});

test("missing and malformed frames do not retry forever or displace valid fallback frames", async (t) => {
  const f = fixture({ count: 9, missing: [0] });
  t.after(() => f.cache.dispose());
  f.cache.setViewport(1280, 720);
  f.cache.prioritize(7, 1);
  await flush();
  const broken = f.decodes.find(({ index }) => index === 7);
  assert(broken);
  f.failBitmap(broken);
  await flush();
  assert.equal(f.images.length, 1);
  f.images[0].onerror();
  await f.settleBitmaps();

  assert.equal(f.cache.loadedCount, 7);
  assert.notEqual(f.cache.nearest(7)?.index, 7);
  assert.equal(f.objectUrls.size, 0);
  assert.equal(f.images[0].src, "");
  f.cache.prioritize(7, -1);
  await flush();
  assert.equal(f.fetches.filter(({ index }) => index === 0).length, 1);
  assert.equal(f.fetches.filter(({ index }) => index === 7).length, 1);
  assert.equal(f.decodes.filter(({ index }) => index === 7).length, 1);
});

test("disposing aborts outstanding fetches and ignores subsequent cache activity", async () => {
  const f = fixture({ autoLoad: false });
  f.cache.prioritize(20, 1);
  assert.equal(f.fetches.length, 4);
  f.cache.dispose();
  await flush();

  assert(f.fetches.every(({ signal }) => signal.aborted));
  assert.equal(f.cache.loadedCount, 0);
  assert.equal(f.readyCalls, 0);
  f.cache.prioritize(1, 1);
  f.cache.setPaused(false);
  assert.equal(f.fetches.length, 4);
});

test("bitmaps resolved after disposal are closed without a readiness callback", async () => {
  const f = fixture({ count: 4 });
  f.cache.prioritize(0, 1);
  await flush();
  const beforeDisposal = f.readyCalls;
  f.cache.dispose();
  for (const record of f.decodes) f.finishBitmap(record);
  await flush();

  assert(f.bitmaps.length > 0);
  assert(f.bitmaps.every((image) => image.closed === 1));
  assert.equal(f.readyCalls, beforeDisposal);
  assert.equal(f.cache.nearest(0), undefined);
});

test("a late bitmap rejection cannot start a fallback image after disposal", async () => {
  const f = fixture({ count: 4 });
  f.cache.prioritize(0, 1);
  await flush();
  f.cache.dispose();
  for (const record of f.decodes) f.failBitmap(record);
  await flush();

  assert.equal(f.images.length, 0);
  assert.equal(f.objectUrls.size, 0);
});

test("fallback image loads revoke object URLs and disposal releases pending and decoded images", async () => {
  const f = fixture({ count: 3, bitmap: false });
  f.cache.prioritize(0, 1);
  await flush();
  assert.equal(f.images.length, 2);
  f.finishImage(f.images[0]);
  await flush();
  assert.equal(f.objectUrls.size, 2);
  assert.equal(f.revoked.length, 1);
  const beforeDisposal = f.readyCalls;
  f.cache.dispose();
  await flush();

  assert.equal(f.objectUrls.size, 0);
  assert.equal(f.revoked.length, 3);
  assert(f.images.every((image) => !image.src && !image.onload && !image.onerror));
  assert.equal(f.cache.loadedCount, 0);
  assert.equal(f.cache.nearest(0), undefined);
  assert.equal(f.readyCalls, beforeDisposal);
});

test("growing a viewport retains the visible frame until a larger decode replaces it", async (t) => {
  const f = fixture({ count: 5 });
  t.after(() => f.cache.dispose());
  f.cache.setViewport(320, 180);
  f.cache.prioritize(4, -1);
  await f.settleBitmaps();
  f.cache.prioritize(3, -1);
  await f.settleBitmaps();
  const before = f.cache.nearest(3).frame.image;
  assert.equal(before.width, 320);
  f.cache.markDisplayed(3);

  f.cache.setViewport(1280, 720);
  f.cache.prioritize(3, -1);
  assert.equal(f.cache.nearest(3).frame.image, before);
  assert.equal(before.closed, 0);
  await f.settleBitmaps();

  assert.equal(f.cache.nearest(3).frame.width, 1280);
  assert.notEqual(f.cache.nearest(3).frame.image, before);
  assert.equal(before.closed, 1);
});

test("a viewport that grows during an in-flight decode receives a full-resolution replacement", async (t) => {
  const f = fixture({ count: 30 });
  t.after(() => f.cache.dispose());
  f.cache.setViewport(1280, 720);
  f.cache.prioritize(0, 1);
  await f.settleBitmaps();
  f.cache.markDisplayed(0);

  f.cache.setViewport(320, 180);
  f.cache.prioritize(20, 1);
  await flush();
  const smallDecode = f.decodes.find(({ index, settled }) => index === 20 && !settled);
  assert(smallDecode);
  assert.equal(smallDecode.options.resizeWidth, 320);

  f.cache.setViewport(1280, 720);
  f.cache.prioritize(20, 1);
  const smallBitmap = f.finishBitmap(smallDecode);
  await f.settleBitmaps();

  assert.equal(f.cache.nearest(20)?.index, 20);
  assert.equal(f.cache.nearest(20).frame.width, 1280);
  assert.equal(smallBitmap.closed, 1);
});
