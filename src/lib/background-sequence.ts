import "server-only";

import { readdir } from "node:fs/promises";
import path from "node:path";

type BackgroundFrameOptions = {
  directory?: string;
  basePath?: string;
};

const filenameOrder = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});

function resolveBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? (process.env.NODE_ENV === "production" ? "/VDDayarathne_Portfolio" : "");
}

/** Discover public assets on the server; only their URLs reach the browser. */
export async function getBackgroundFrames(
  {
    directory = path.join(process.cwd(), "public", "images", "Background"),
    basePath = resolveBasePath(),
  }: BackgroundFrameOptions = {},
): Promise<string[]> {
  let entries;

  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error.code === "ENOENT" || error.code === "ENOTDIR")
    ) {
      return [];
    }

    throw error;
  }

  const prefix = basePath.replace(/\/+$/, "");

  return entries
    .filter((entry) => entry.isFile() && /\.jpe?g$/i.test(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => {
      const naturalOrder = filenameOrder.compare(left, right);
      // Case and zero-padding can compare equally; keep the result reproducible.
      return naturalOrder || (left < right ? -1 : left > right ? 1 : 0);
    })
    .map((filename) => `${prefix}/images/Background/${encodeURIComponent(filename)}`);
}
