import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import os from "node:os";
import path from "node:path";
import test from "node:test";

// Next supplies the server-only alias during compilation. These filesystem tests
// run without the framework, so resolve its empty marker.
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "server-only") {
      return { url: "data:text/javascript,export%20%7B%7D", shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
const { getBackgroundFrames } = await import("../src/lib/background-sequence.ts");
hooks.deregister();

test("discovers regular JPEG files in numeric order and encodes public URLs", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "portfolio-frames-"));

  try {
    await Promise.all(
      [
        "frame_10.jpg",
        "frame_2.jpg",
        "frame_1.JPG",
        "frame_01.JPG",
        "frame_3.JPEG",
        "frame_4 #é.jpg",
        "frame_5.png",
        "notes.txt",
        "frame_6.jpg.tmp",
      ].map((filename) => writeFile(path.join(directory, filename), "fixture")),
    );
    await mkdir(path.join(directory, "frame_0.jpg"));

    assert.deepEqual(await getBackgroundFrames({ directory }), [
      "/images/Background/frame_01.JPG",
      "/images/Background/frame_1.JPG",
      "/images/Background/frame_2.jpg",
      "/images/Background/frame_3.JPEG",
      "/images/Background/frame_4%20%23%C3%A9.jpg",
      "/images/Background/frame_10.jpg",
    ]);
    assert.equal(
      (await getBackgroundFrames({ directory, basePath: "/portfolio/" }))[0],
      "/portfolio/images/Background/frame_01.JPG",
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("empty or missing frame directories return an empty sequence", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "portfolio-empty-"));

  try {
    assert.deepEqual(await getBackgroundFrames({ directory }), []);
    assert.deepEqual(
      await getBackgroundFrames({ directory: path.join(directory, "missing") }),
      [],
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
