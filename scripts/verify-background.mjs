import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readdir, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import * as content from "../src/data/profile.ts";

// Run against a production server. Launching Chrome may require approval from
// the workspace runner: node scripts/verify-background.mjs http://localhost:3000
const origin = process.argv[2] ?? "http://localhost:3000";
const browser = process.env.BACKGROUND_TEST_BROWSER ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = Number(process.env.BACKGROUND_TEST_PORT ?? 9229);
const files = (await readdir("public/images/Background"))
  .filter((file) => /\.jpe?g$/i.test(file))
  .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
assert(files.length > 1, "Expected a usable JPG sequence");
const frameNumber = (url) => files.indexOf(decodeURIComponent(new URL(url, origin).pathname.split("/").at(-1)));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const profile = await mkdtemp(path.join(tmpdir(), "portfolio-background-test-"));
const child = spawn(browser, [
  "--headless=new", "--no-first-run", "--no-default-browser-check",
  "--disable-background-networking", `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`, "about:blank",
], { windowsHide: true, stdio: ["ignore", "ignore", "pipe"] });
let browserOutput = "";
child.stderr.on("data", (data) => { browserOutput += data.toString(); });
child.on("error", (error) => { browserOutput += error.message; });

class Connection {
  constructor(socket) {
    this.socket = socket;
    this.id = 0;
    this.pending = new Map();
    this.handlers = new Map();
    socket.addEventListener("message", ({ data }) => {
      const message = JSON.parse(data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        clearTimeout(pending.timer);
        if (message.error) pending.reject(new Error(JSON.stringify(message.error)));
        else pending.resolve(message.result);
      } else {
        for (const handler of this.handlers.get(message.method) ?? []) {
          Promise.resolve(handler(message.params)).catch((error) => this.errors.push(error));
        }
      }
    });
    this.errors = [];
  }
  on(method, handler) {
    const handlers = this.handlers.get(method) ?? [];
    handlers.push(handler);
    this.handlers.set(method, handlers);
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP timed out: ${method}`));
      }, 20_000);
      this.pending.set(id, { resolve, reject, timer });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }
  close() { this.socket.close(); }
}

const instrumentation = `(() => {
  const probe = window.__backgroundProbe = { contexts: [], draws: 0, last: null, blankDraws: 0, bitmapCalls: 0, bitmapBytes: 0, peakBitmapBytes: 0, rafCallbacks: 0, touchEvents: [], introSamples: [], layoutShift: 0 };
  try {
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) probe.layoutShift += entry.value;
    }).observe({type:"layout-shift",buffered:true});
  } catch { /* Layout shift observation is optional in older Chromium. */ }
  const sampleIntro = delay => {
    const items=[...document.querySelectorAll("[data-intro]")].map(element => {
      const style=getComputedStyle(element);
      return {opacity:Number(style.opacity),transform:style.transform};
    });
    if (items.length) probe.introSamples.push({delay,items});
  };
  const introObserver = new MutationObserver(() => {
    if (!document.querySelector("[data-intro]")) return;
    sampleIntro("parsed");
    introObserver.disconnect();
  });
  introObserver.observe(document,{childList:true,subtree:true});
  document.addEventListener("DOMContentLoaded", () => {
    for (const delay of [0,200,700,1900]) setTimeout(() => {
      sampleIntro(delay);
    },delay);
    const sampleSettled = () => setTimeout(() => sampleIntro("settled"),1700);
    if (document.documentElement.classList.contains("motion-started")) sampleSettled();
    else {
      const motionObserver = new MutationObserver(() => {
        if (!document.documentElement.classList.contains("motion-started")) return;
        motionObserver.disconnect();
        sampleSettled();
      });
      motionObserver.observe(document.documentElement,{attributes:true,attributeFilter:["class"]});
    }
  },{once:true});
  const originalRaf = window.requestAnimationFrame;
  window.requestAnimationFrame = callback => originalRaf.call(window,time => {probe.rafCallbacks++;callback(time);});
  for (const type of ["touchstart","touchmove","touchend"]) {
    document.addEventListener(type,event => queueMicrotask(() => {
      if (probe.touchEvents.length < 40) probe.touchEvents.push({type,trusted:event.isTrusted,cancelable:event.cancelable,
        prevented:event.defaultPrevented,target:event.target?.tagName,scrollY});
    }),{passive:true});
  }
  const sources = new WeakMap();
  const bitmapSizes = new WeakMap();
  const objectUrls = new Map();
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const response = await originalFetch.apply(this,args);
    const originalBlob = response.blob;
    response.blob = async function() {
      const blob = await originalBlob.call(this);
      sources.set(blob,response.url || String(args[0]));
      return blob;
    };
    return response;
  };
  if (window.createImageBitmap) {
    const originalBitmap = window.createImageBitmap;
    window.createImageBitmap = async function(...args) {
      probe.bitmapCalls++;
      const bitmap = await originalBitmap.apply(this,args);
      sources.set(bitmap,sources.get(args[0]) || "");
      const bytes = bitmap.width * bitmap.height * 4;
      bitmapSizes.set(bitmap,bytes);
      probe.bitmapBytes += bytes;
      probe.peakBitmapBytes = Math.max(probe.peakBitmapBytes,probe.bitmapBytes);
      return bitmap;
    };
    const originalClose = ImageBitmap.prototype.close;
    ImageBitmap.prototype.close = function() {
      probe.bitmapBytes -= bitmapSizes.get(this) || 0;
      bitmapSizes.delete(this);
      return originalClose.call(this);
    };
  }
  const originalObjectUrl = URL.createObjectURL;
  URL.createObjectURL = function(blob) {
    const url = originalObjectUrl.call(this,blob);
    objectUrls.set(url,sources.get(blob) || "");
    return url;
  };
  const originalContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(kind, ...args) {
    probe.contexts.push(kind);
    return originalContext.call(this, kind, ...args);
  };
  const originalDraw = CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage = function(image, ...args) {
    originalDraw.call(this, image, ...args);
    const transform = this.getTransform();
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    const sourceRect = args.length === 8 ? args.slice(0, 4) : [0, 0, sourceWidth, sourceHeight];
    const rect = args.length === 8 ? args.slice(4) : args.length === 4 ? args : [args[0], args[1], sourceWidth, sourceHeight];
    const canvas = this.canvas;
    const alpha = [[0,0], [canvas.width-1,0], [0,canvas.height-1], [canvas.width-1,canvas.height-1], [Math.floor(canvas.width/2),Math.floor(canvas.height/2)]]
      .map(([x,y]) => this.getImageData(x,y,1,1).data[3]);
    if (alpha.some(value => value !== 255)) probe.blankDraws++;
    probe.draws++;
    probe.last = { src: sources.get(image) || objectUrls.get(image.currentSrc || image.src) || image.currentSrc || image.src || "", sourceWidth, sourceHeight, sourceRect, rect,
      transform: { a: transform.a, d: transform.d, e: transform.e, f: transform.f }, alpha, time: performance.now() };
  };
})()`;

const sessions = [];
const results = [];
let activeSession;
let scenario = "Chrome startup";
function progress(label) {
  scenario = label;
  console.log(`[background] ${label}`);
}
async function connect() {
  const response = await fetch(`http://localhost:${port}/json/new?about:blank`, { method: "PUT" });
  const target = await response.json();
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  const cdp = new Connection(socket);
  cdp.target = target.id;
  cdp.runtimeErrors = [];
  cdp.consoleErrors = [];
  cdp.on("Runtime.exceptionThrown", (event) => cdp.runtimeErrors.push(event.exceptionDetails));
  cdp.on("Runtime.consoleAPICalled", (event) => {
    if (event.type === "error") cdp.consoleErrors.push(event.args.map((arg) => arg.value ?? arg.description).join(" "));
  });
  await cdp.send("Page.enable");
  await cdp.send("Page.bringToFront");
  await cdp.send("Runtime.enable");
  await cdp.send("Network.enable");
  await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: instrumentation });
  sessions.push(cdp);
  activeSession = cdp;
  return cdp;
}

async function until(getValue, predicate, label, timeout = 15_000) {
  const deadline = Date.now() + timeout;
  let value;
  do {
    value = await getValue();
    if (predicate(value)) return value;
    await sleep(75);
  } while (Date.now() < deadline);
  throw new Error(`${label}; last state: ${JSON.stringify(value)}`);
}

const snapshot = async (cdp) => {
  const state = await cdp.evaluate(`(() => {
  if (!document.documentElement || !document.body) return {canvasCount:0,last:null,loading:true};
  const canvases = [...document.querySelectorAll("canvas")];
  const canvas = canvases[0];
  const rect = canvas?.getBoundingClientRect();
  const style = canvas && getComputedStyle(canvas);
  const probe = window.__backgroundProbe;
  return { canvasCount: canvases.length, width: canvas?.width, height: canvas?.height, rect: rect?.toJSON(),
    pointerEvents: style?.pointerEvents, position: style?.position, ariaHidden: canvas?.getAttribute("aria-hidden"),
    tabIndex: canvas?.tabIndex, data: canvas ? {...canvas.dataset} : {}, contexts: probe?.contexts, draws: probe?.draws,
    blankDraws: probe?.blankDraws, bitmapCalls: probe?.bitmapCalls, bitmapBytes: probe?.bitmapBytes, peakBitmapBytes: probe?.peakBitmapBytes, rafCallbacks: probe?.rafCallbacks,
    last: probe?.last, scrollY, viewport: {width: innerWidth, clientWidth: document.documentElement.clientWidth, height: innerHeight, dpr: devicePixelRatio},
    input: {touchPoints:navigator.maxTouchPoints,htmlClasses:document.documentElement.className,htmlOverflow:getComputedStyle(document.documentElement).overflowY,
      bodyOverflow:getComputedStyle(document.body).overflowY,touchAction:getComputedStyle(document.body).touchAction,touchEvents:probe?.touchEvents},
    scrollRange: document.documentElement.scrollHeight - innerHeight,
    domImages: document.querySelectorAll('img[src*="/images/Background/"]').length };
})()`);
  cdp.lastSnapshot = state;
  return state;
};

function verifyCanvas(state, label) {
  assert.equal(state.canvasCount, 1, `${label}: exactly one canvas`);
  assert(state.last, `${label}: at least one JPG is drawn`);
  assert.equal(state.domImages, 0, `${label}: sequence stays off the DOM`);
  assert(state.contexts.every((kind) => kind === "2d"), `${label}: no WebGL context`);
  assert.equal(state.pointerEvents, "none", `${label}: canvas does not intercept interactions`);
  assert.equal(state.ariaHidden, "true", `${label}: decorative canvas is hidden from accessibility tree`);
  assert.equal(state.tabIndex, -1, `${label}: canvas is not a tab stop`);
  assert.equal(state.blankDraws, 0, `${label}: all rendered frames cover all sampled canvas pixels`);
  assert(Math.abs(state.rect.width - state.viewport.clientWidth) <= 1, `${label}: canvas fills viewport width excluding the native scrollbar`);
  assert(Math.abs(state.rect.height - state.viewport.height) <= 1, `${label}: canvas fills viewport height`);
  const [dx, dy, dw, dh] = state.last.rect;
  const [, , sw, sh] = state.last.sourceRect;
  assert(Math.abs(dw / dh - sw / sh) < 0.0001, `${label}: source aspect ratio is preserved`);
  const { a, d, e, f } = state.last.transform;
  assert(dx * a + e <= 1 && dy * d + f <= 1, `${label}: cover starts at viewport edges`);
  assert((dx + dw) * a + e >= state.width - 1 && (dy + dh) * d + f >= state.height - 1, `${label}: cover reaches viewport edges`);
  const effectiveDpr = state.width / state.rect.width;
  assert(effectiveDpr >= 1 && effectiveDpr <= state.viewport.dpr + 0.01, `${label}: backing resolution respects DPR`);
}

async function scrollToFrame(cdp, fraction, expectedIndex = null, timeout = 15_000) {
  await cdp.evaluate(`window.scrollTo({top: (document.documentElement.scrollHeight - innerHeight) * ${fraction}, behavior: "instant"})`);
  return until(() => snapshot(cdp), (state) => {
    if (!state.last) return false;
    const mappedIndex = Math.round((state.scrollY / Math.max(1, state.scrollRange)) * (files.length - 1));
    const targetIndex = Number(state.data.targetFrameIndex);
    const resolvedIndex = expectedIndex ?? targetIndex;
    return Math.abs(targetIndex - mappedIndex) <= 1 && frameNumber(state.last.src) === resolvedIndex;
  }, `Scroll ${fraction} reaches ${expectedIndex == null ? "its mapped frame" : `frame ${expectedIndex}`}`, timeout);
}

async function waitForScrollToSettle(cdp) {
  let lastY;
  let stableSince = Date.now();
  await until(() => cdp.evaluate("scrollY"), (y) => {
    if (y !== lastY) stableSince = Date.now();
    lastY = y;
    return Date.now()-stableSince >= 300;
  }, "Native scrolling settles before the next test action",5000);
}

async function click(cdp, selector) {
  const point = await cdp.evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    const rect = element?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return null;
    const x = rect.x + rect.width / 2, y = rect.y + rect.height / 2;
    const hit = document.elementFromPoint(x,y);
    return {
      x,y,
      reachable: element === hit || element.contains(hit),
      rect: {x:rect.x,y:rect.y,width:rect.width,height:rect.height},
      viewport: {width:innerWidth,height:innerHeight},
      hit: hit ? {tag:hit.tagName,id:hit.id,className:String(hit.className)} : null,
    };
  })()`);
  assert(point?.reachable, `${selector}: content is above the background and reachable (${JSON.stringify(point)})`);
  await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 });
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
}

async function verifyHealthy(cdp, label) {
  assert.deepEqual(cdp.runtimeErrors, [], `${label}: no runtime exceptions`);
  assert.deepEqual(cdp.consoleErrors, [], `${label}: no console errors`);
  assert.deepEqual(cdp.errors, [], `${label}: no CDP handler errors`);
}

async function verifyMobileTouch() {
  progress("Fresh mobile page: trusted touch swipe and menu interactions");
  const mobile = await connect();
  await mobile.send("Emulation.setDeviceMetricsOverride", {width:390,height:844,deviceScaleFactor:3,mobile:true});
  await mobile.send("Emulation.setTouchEmulationEnabled", {enabled:true,maxTouchPoints:1});
  await mobile.send("Page.navigate", {url:origin});
  await until(() => snapshot(mobile), state => Boolean(state.last), "Mobile first frame displays");
  await click(mobile, 'button[aria-label="Toggle menu"]');
  await until(() => mobile.evaluate("document.documentElement.classList.contains('noscroll')"), Boolean, "Fresh mobile menu opens");
  await sleep(300);
  await click(mobile, 'button[aria-label="Close menu"]');
  await until(() => mobile.evaluate("document.documentElement.classList.contains('noscroll')"), open => !open, "Fresh mobile menu closes");
  await sleep(350); // Allow the existing menu exit animation to finish before touching page content.
  const start = {x:195,y:650,id:0,radiusX:5,radiusY:5,force:1};
  await mobile.send("Input.dispatchTouchEvent", {type:"touchStart",touchPoints:[start]});
  for (let step=1;step<=15;step++) {
    await mobile.send("Input.dispatchTouchEvent", {type:"touchMove",touchPoints:[{...start,y:650-step*30}]});
    await sleep(30);
  }
  await mobile.send("Input.dispatchTouchEvent", {type:"touchEnd",touchPoints:[]});
  const state = await until(() => snapshot(mobile), state => state.scrollY>100,"Native touch swipe scrolls the mobile portfolio");
  assert(state.input.touchEvents.some(event => event.type==="touchstart" && event.trusted),"Browser delivers a trusted touchstart");
  assert(state.input.touchEvents.some(event => event.type==="touchmove" && event.trusted),"Browser delivers trusted touchmove events");
  verifyCanvas(state,"mobile native touch scrolling");
  await verifyHealthy(mobile,"mobile native touch scrolling");
  results.push({scenario:"fresh mobile page and trusted native touch input",scrollY:state.scrollY,touchEvents:state.input.touchEvents.length});
}

function contrast(color, background = [255,255,255]) {
  const luminance = (rgb) => rgb.map(channel => {
    const value = channel/255;
    return value <= 0.04045 ? value/12.92 : ((value+0.055)/1.055)**2.4;
  }).reduce((sum,value,index) => sum+value*[0.2126,0.7152,0.0722][index],0);
  const a = luminance(color), b = luminance(background);
  return (Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
}

async function appearanceState(cdp) {
  return cdp.evaluate(`(() => {
    const read = (element) => {
      if (!element) return null;
      const style = getComputedStyle(element), rect = element.getBoundingClientRect();
      return {text:element.textContent?.trim(),color:style.color,background:style.backgroundColor,font:style.fontFamily,
        classes:element.className,rect:rect.toJSON()};
    };
    const canvas = document.querySelector('canvas');
    const heading = document.querySelector('#top h1');
    const canvasRect = canvas.getBoundingClientRect();
    const headingRect = heading.firstElementChild.getBoundingClientRect();
    const x = Math.max(0,Math.min(canvas.width-1,Math.floor((headingRect.x+headingRect.width*0.35-canvasRect.x)*canvas.width/canvasRect.width)));
    const y = Math.max(0,Math.min(canvas.height-1,Math.floor((headingRect.y+headingRect.height*0.5-canvasRect.y)*canvas.height/canvasRect.height)));
    const pixel = [...canvas.getContext('2d').getImageData(x,y,1,1).data];
    const fields = [...document.querySelectorAll('#contact input,#contact textarea')].map(element => ({
      id:element.id,color:getComputedStyle(element).color,background:getComputedStyle(element).backgroundColor,
      border:getComputedStyle(element).borderTopColor,fontSize:parseFloat(getComputedStyle(element).fontSize),
      placeholderColor:getComputedStyle(element,'::placeholder').color,placeholderOpacity:getComputedStyle(element,'::placeholder').opacity,
      classes:element.className,value:element.value
    }));
    return {body:read(document.body),heading:read(heading),navigation:read(document.querySelector('header nav a[href="#about"]')),
      sectionHeadings:[...document.querySelectorAll('section h2')].map(read),primary:read(document.querySelector('#top a[href="#projects"]')),
      fields,headingCanvasPixel:pixel,scrollY,viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},
      sectionIds:[...document.querySelectorAll('main section[id]')].map(element=>element.id),
      overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,
      overflowElements:[...document.querySelectorAll('main *,header *,footer *')].filter(element=>element.getBoundingClientRect().right>document.documentElement.clientWidth+0.5).slice(0,12).map(element=>({tag:element.tagName,classes:element.className,text:element.textContent.slice(0,80),right:element.getBoundingClientRect().right})),
      portraits:document.querySelectorAll('main img').length,
      text:document.querySelector('main').innerText.replace(/\\s+/g,' ').trim()};
  })()`);
}

function verifyAppearance(state,label) {
  const ink = "rgb(24, 43, 48)", muted = "rgb(67, 86, 92)", accent = "rgb(36, 94, 102)";
  assert.equal(state.body.color,ink,`${label}: body uses dark ink`);
  assert.equal(state.heading.color,ink,`${label}: hero heading uses dark ink`);
  assert([muted,accent].includes(state.navigation.color),`${label}: navigation uses readable muted ink or its active accent`);
  assert(state.sectionHeadings.length>=6,`${label}: portfolio headings remain present`);
  for (const heading of state.sectionHeadings) {
    assert.equal(heading.color,ink,`${label}: section heading ${heading.text} uses dark ink`);
    assert(heading.font.toLowerCase().includes("inter"),`${label}: section heading uses Inter`);
  }
  assert(state.heading.font.toLowerCase().includes("inter"),`${label}: hero heading uses Inter`);
  assert(state.body.font.toLowerCase().includes("inter"),`${label}: body keeps the Inter font`);
  assert.equal(state.primary.background,accent,`${label}: primary button uses the shared teal accent`);
  assert.equal(state.primary.color,"rgb(255, 255, 255)",`${label}: primary button has contrasting white text`);
  assert.deepEqual(state.sectionIds,["top","about","experience","projects","skills","education","contact"],`${label}: section order remains intact`);
  assert.equal(state.fields.length,3,`${label}: all existing contact fields remain present`);
  for (const field of state.fields) {
    assert.equal(field.color,ink,`${label}: ${field.id} typed text uses ink`);
    assert.equal(field.placeholderColor,muted,`${label}: ${field.id} placeholder uses readable muted ink`);
    assert.equal(field.background,"rgb(255, 255, 255)",`${label}: ${field.id} has a dependable light surface`);
    assert(contrast(field.border.match(/[\d.]+/g).slice(0,3).map(Number))>=3,`${label}: ${field.id} boundary exceeds 3:1 contrast`);
    if (state.viewport.width<640) assert(field.fontSize>=16,`${label}: field size avoids mobile focus zoom`);
  }
  assert.equal(state.overflow,false,`${label}: no horizontal overflow: ${JSON.stringify(state.overflowElements)}`);
  assert.equal(state.portraits,0,`${label}: removed hero portrait stays removed`);
  // A black sequence pixel under the 12% fixed veil and 86% section surface.
  const worstVeil = [246,247,245].map(channel=>channel*(1-(1-0.12)*(1-0.86)));
  const inkContrast = contrast([24,43,48],worstVeil), mutedContrast = contrast([67,86,92],worstVeil);
  assert(inkContrast>=4.5 && mutedContrast>=4.5,`${label}: copy exceeds 4.5:1 over the darkest background under the reading veil`);
  assert(contrast([255,255,255],[36,94,102])>=4.5,`${label}: button text passes contrast`);
  return {inkContrast,mutedContrast,buttonContrast:contrast([255,255,255],[36,94,102])};
}

async function saveScreenshot(cdp,name) {
  await mkdir(".background-verification",{recursive:true});
  const screenshot = await cdp.send("Page.captureScreenshot",{format:"png"});
  await writeFile(`.background-verification/${name}.png`,Buffer.from(screenshot.data,"base64"));
}

function verifyContent(text,label) {
  const facts = [
    content.profile.name,content.profile.tagline,content.profile.summary,...content.profile.roles,
    content.profile.location,content.profile.email,content.profile.phone,
    ...content.stats.flatMap(item=>[item.label,item.value]),
    ...content.experience.flatMap(item=>[item.company,item.role,item.period,item.location,...item.bullets]),
    ...content.projects.flatMap(item=>[item.title,item.tag,item.role,item.description,...item.tools,...(item.links??[]).map(link=>link.label)]),
    ...content.education.flatMap(item=>[item.school,item.program,item.period,item.location,...(item.details??[])]),
    ...content.leadership.flatMap(item=>[item.title,item.org,...item.bullets]),
    ...content.extracurricular,...content.skills.flatMap(item=>[item.category,...item.skills]),...content.softSkills,
  ];
  for (const fact of facts) assert(text.toLowerCase().includes(fact.replace(/\s+/g," ").trim().toLowerCase()),`${label}: preserved content: ${fact}`);
}

async function key(cdp,key,code=key,extra={}) {
  await cdp.send("Input.dispatchKeyEvent",{type:"keyDown",key,code,...extra});
  await cdp.send("Input.dispatchKeyEvent",{type:"keyUp",key,code,...extra});
}

async function verifyInteractions() {
  progress("Accessible desktop navigation, skill filters, form validation, and keyboard focus");
  const cdp = await connect();
  await cdp.send("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await cdp.send("Page.navigate",{url:origin});
  await until(()=>snapshot(cdp),state=>Boolean(state.last),"Interaction page ready");
  await until(
    ()=>cdp.evaluate("window.__backgroundProbe.introSamples.find(sample=>sample.delay==='settled')"),
    Boolean,
    "Opening sequence settles",
  );
  const opening=await cdp.evaluate("({samples:window.__backgroundProbe.introSamples,layoutShift:window.__backgroundProbe.layoutShift,started:document.documentElement.classList.contains('motion-started')})");
  assert(opening.started,"Opening sequence waits for the local font before starting");
  assert(opening.samples[0].items.length>=5,"Navigation and hero participate in one opening sequence");
  assert(
    opening.samples.slice(0,3).some(sample=>sample.items.some(item=>item.opacity<0.5)),
    `Opening elements are prepared before their entrance: ${JSON.stringify(opening.samples.slice(0,3))}`,
  );
  assert(opening.samples.at(-1).items.every(item=>item.opacity>0.98),"Opening sequence settles with all content visible");
  assert(opening.layoutShift<0.05,`Opening animation avoids layout shifts: ${opening.layoutShift}`);
  assert(await cdp.evaluate("document.querySelectorAll('[data-scroll-handoff]').length>=15"),"Sections, rows, projects, and footer share the scroll handoff system");
  await cdp.send("Input.dispatchMouseEvent",{type:"mouseMoved",x:240,y:200});
  await until(()=>cdp.evaluate("document.querySelector('[data-custom-cursor]')?.dataset.visible"),value=>value==="true","Mouse activates the restored cursor");
  assert.equal(await cdp.evaluate("getComputedStyle(document.querySelector('[data-custom-cursor]')).mixBlendMode"),"difference","Original cursor blend identity is retained");
  const projectLink=await cdp.evaluate("document.querySelector('#top a[href=\"#projects\"]').getBoundingClientRect().toJSON()");
  await cdp.send("Input.dispatchMouseEvent",{type:"mouseMoved",x:projectLink.x+20,y:projectLink.y+20});
  assert.equal(await cdp.evaluate("document.querySelector('[data-custom-cursor]').dataset.hover"),"true","Cursor responds to interactive elements");
  await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  await until(()=>cdp.evaluate("document.documentElement.classList.contains('cursor-active')"),value=>!value,"Reduced motion restores the native cursor");
  assert.equal(await cdp.evaluate("getComputedStyle(document.querySelector('[data-custom-cursor]')).display"),"none","Reduced motion hides the custom cursor");
  assert(await cdp.evaluate("[...document.querySelectorAll('[data-scroll-handoff]')].every(item=>{const style=getComputedStyle(item);return style.opacity==='1'&&style.transform==='none'})"),"Reduced motion removes scroll-linked handoff transforms");
  await cdp.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"no-preference"}]});
  await cdp.evaluate("new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))");
  await cdp.send("Input.dispatchMouseEvent",{type:"mouseMoved",x:241,y:201});
  await until(()=>cdp.evaluate("document.documentElement.classList.contains('cursor-active')"),Boolean,"Cursor resumes after a preference change");
  await key(cdp,"Tab","Tab",{windowsVirtualKeyCode:9});
  assert.equal(await cdp.evaluate("document.documentElement.classList.contains('cursor-active')"),false,"Keyboard input hides the custom cursor");
  await click(cdp,'header a[href="#about"]');
  await until(()=>cdp.evaluate("location.hash"),hash=>hash==="#about","Anchor preserves URL hash");
  await waitForScrollToSettle(cdp);
  await until(()=>cdp.evaluate("document.querySelector('header nav a[aria-current=location]')?.hash"),hash=>hash==="#about","Active navigation follows the section");
  const anchor = await cdp.evaluate("({top:document.getElementById('about').getBoundingClientRect().top,focus:document.activeElement.id})");
  assert(anchor.top>=80 && anchor.top<=130,"Anchor clears the fixed header");
  assert.equal(anchor.focus,"about","Desktop anchor moves keyboard focus to its section");
  assert(await cdp.evaluate("Number(getComputedStyle(document.querySelector('[data-scroll-handoff=hero]')).opacity)<0.9"),"Hero de-emphasizes as the next section takes priority");
  await cdp.evaluate("history.back()");
  await until(()=>cdp.evaluate("location.hash"),hash=>hash==="","Back restores the prior URL");
  await waitForScrollToSettle(cdp);
  assert(await cdp.evaluate("scrollY<=2"),"Back restores the prior scroll position");

  await cdp.evaluate("document.querySelector('.skills-filter').scrollIntoView({block:'center',behavior:'instant'})");
  await waitForScrollToSettle(cdp);
  for (let index=0;index<content.skills.length;index++) {
    const expected=content.skills[index];
    await click(cdp,`.skills-filter button:nth-child(${index+2})`);
    await until(()=>cdp.evaluate("document.querySelector('.skills-filter [aria-pressed=true]').textContent"),label=>label===expected.category,"Skill filter is selected");
    assert.deepEqual(await cdp.evaluate("[...document.querySelectorAll('#technical-skills li')].map(item=>item.textContent)"),expected.skills,`${expected.category}: filter returns the correct skills`);
  }
  await click(cdp,'.skills-filter button:first-child');
  assert.equal(await cdp.evaluate("document.querySelectorAll('#technical-skills li').length"),content.skills.flatMap(item=>item.skills).length,"All restores the complete toolkit");
  assert.equal(await cdp.evaluate("document.querySelectorAll('#projects a[href=\"#\"]').length"),0,"Unavailable project URLs cannot jump to the top");
  assert.equal(await cdp.evaluate("document.querySelector('#top a[href$=\".pdf\"]').getAttribute('href')"),content.profile.resumeUrl,"Existing CV link preserved");
  for (const url of [content.profile.github,content.profile.linkedin,`mailto:${content.profile.email}`,`tel:${content.profile.phone.replace(/\s/g,"")}`]) {
    assert(await cdp.evaluate(`Boolean(document.querySelector('a[href=${JSON.stringify(url)}]'))`),`Preserved contact action ${url}`);
  }
  assert.equal(await cdp.evaluate("document.querySelector('#contact form').checkValidity()"),false,"Contact requires completed fields");
  assert.equal(await cdp.evaluate("document.querySelector('#contact button').type"),"submit","Contact CTA is a submit button");
  await key(cdp,"Tab","Tab",{windowsVirtualKeyCode:9});
  await cdp.evaluate("document.querySelector('.skip-link').focus()");
  const focus = await cdp.evaluate("({visible:document.querySelector('.skip-link').getBoundingClientRect().top>=0,outline:getComputedStyle(document.activeElement).outlineStyle})");
  assert(focus.visible && focus.outline!=="none","Keyboard skip link and focus ring are visible");
  await key(cdp,"Enter","Enter",{windowsVirtualKeyCode:13});
  await until(()=>cdp.evaluate("document.activeElement.id"),id=>id==="main-content","Skip link focuses main content");

  progress("Mobile dialog focus containment, Escape, anchor links, and resize cleanup");
  const mobile=await connect();
  await mobile.send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:2,mobile:true});
  await mobile.send("Emulation.setTouchEmulationEnabled",{enabled:true,maxTouchPoints:1});
  await mobile.send("Page.navigate",{url:origin});
  await until(()=>snapshot(mobile),state=>Boolean(state.last),"Mobile interaction page ready");
  assert.equal(await mobile.evaluate("getComputedStyle(document.querySelector('[data-custom-cursor]')).display"),"none","Touch devices use the native cursor");
  assert(await mobile.evaluate("[...document.querySelectorAll('[data-scroll-handoff]')].every(item=>{const style=getComputedStyle(item);return style.opacity==='1'&&style.transform==='none'})"),"Mobile keeps section handoffs immediate and lightweight");
  await click(mobile,'button[aria-label="Toggle menu"]');
  await until(()=>mobile.evaluate("Boolean(document.querySelector('[role=dialog]')?.contains(document.activeElement))"),Boolean,"Menu moves focus inside");
  await mobile.evaluate("document.querySelector('[role=dialog] a[aria-label=Email]').focus()");
  await key(mobile,"Tab","Tab",{windowsVirtualKeyCode:9});
  assert.equal(await mobile.evaluate("document.activeElement.getAttribute('aria-label')"),"Close menu","Tab wraps inside the mobile dialog");
  await key(mobile,"Escape","Escape",{windowsVirtualKeyCode:27});
  await until(()=>mobile.evaluate("document.documentElement.classList.contains('noscroll')"),value=>!value,"Escape releases scroll lock");
  assert.equal(await mobile.evaluate("document.activeElement.getAttribute('aria-label')"),"Toggle menu","Escape restores trigger focus");
  await sleep(300);
  await click(mobile,'button[aria-label="Toggle menu"]');
  await until(()=>mobile.evaluate("Boolean(document.querySelector('[role=dialog]'))"),Boolean,"Menu reopens");
  await sleep(300);
  await click(mobile,'#mobile-navigation a[href="#projects"]');
  await until(()=>mobile.evaluate("location.hash"),hash=>hash==="#projects","Mobile anchor preserves its URL");
  await waitForScrollToSettle(mobile);
  assert.equal(await mobile.evaluate("document.documentElement.classList.contains('noscroll')"),false,"Menu link releases scrolling");
  await sleep(300);
  await click(mobile,'button[aria-label="Toggle menu"]');
  await until(()=>mobile.evaluate("document.documentElement.classList.contains('noscroll')"),Boolean,"Menu opens before desktop resize");
  await mobile.send("Emulation.setDeviceMetricsOverride",{width:1280,height:800,deviceScaleFactor:1,mobile:false});
  await until(()=>mobile.evaluate("document.documentElement.classList.contains('noscroll')"),value=>!value,"Desktop resize releases menu lock");
  await verifyHealthy(cdp,"desktop UI interactions");
  await verifyHealthy(mobile,"mobile UI interactions");

  progress("Server-rendered content remains readable with JavaScript disabled");
  const nojs=await connect();
  await nojs.send("Emulation.setScriptExecutionDisabled",{value:true});
  await nojs.send("Page.navigate",{url:origin});
  await until(()=>nojs.evaluate("Boolean(document.querySelector('#contact form'))"),Boolean,"No-JS HTML is complete");
  const state=await nojs.evaluate("({text:document.querySelector('main').innerText.replace(/\\s+/g,' ').trim(),hidden:[...document.querySelectorAll('.reveal,.stagger-item')].some(item=>getComputedStyle(item).opacity==='0'),overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth})");
  verifyContent(state.text,"no JavaScript");
  assert(!state.hidden && !state.overflow,"No-JS content is visible without overflow");
  results.push({scenario:"responsive UI, preserved content, keyboard navigation, filters, no JavaScript",passed:true});
}

async function verifyAppearanceOnly() {
  const checks = [];
  for (const viewport of [
    {width:1920,height:1080,deviceScaleFactor:1,mobile:false,name:"large-desktop"},
    {width:1440,height:900,deviceScaleFactor:1,mobile:false,name:"desktop"},
    {width:1024,height:768,deviceScaleFactor:1,mobile:false,name:"laptop"},
    {width:768,height:1024,deviceScaleFactor:2,mobile:true,name:"tablet"},
    {width:390,height:844,deviceScaleFactor:2,mobile:true,name:"mobile"},
    {width:320,height:740,deviceScaleFactor:2,mobile:true,name:"small-mobile"},
  ]) {
    progress(`Readability ${viewport.name}: design system, content, layout, and contact typing`);
    const cdp = await connect();
    const {name,...metrics} = viewport;
    await cdp.send("Emulation.setDeviceMetricsOverride",metrics);
    if (metrics.mobile) await cdp.send("Emulation.setTouchEmulationEnabled",{enabled:true,maxTouchPoints:1});
    await cdp.send("Page.navigate",{url:origin});
    await until(()=>snapshot(cdp),state=>state.last && frameNumber(state.last.src)===0,`${name} first JPG appears`);
    await cdp.evaluate("document.fonts.ready");
    await sleep(300);
    verifyCanvas(await snapshot(cdp),`${name} canvas after palette changes`);
    const state = await appearanceState(cdp);
    const contrasts = verifyAppearance(state,name);
    verifyContent(state.text,name);
    assert.equal(await cdp.evaluate("getComputedStyle(document.querySelector('.mobile-menu-toggle')).display==='none'"),metrics.width>=1024,`${name}: menu toggle matches the navigation breakpoint`);
    await saveScreenshot(cdp,name);
    await cdp.evaluate("document.getElementById('name').scrollIntoView({behavior:'instant',block:'center'})");
    await waitForScrollToSettle(cdp);
    await sleep(700); // Let the existing contact Reveal complete; do not alter animation preferences.
    await click(cdp,"#name");
    await cdp.send("Input.insertText",{text:"Browser Readability Check"});
    assert.equal(await cdp.evaluate("document.getElementById('name').value"),"Browser Readability Check",`${name}: real browser text input updates the React form`);
    await saveScreenshot(cdp,`${name}-contact`);
    if (name==="desktop") {
      for (const section of ["about","experience","projects","skills","education"]) {
        await cdp.evaluate(`document.getElementById('${section}').scrollIntoView({behavior:'instant',block:'start'})`);
        await waitForScrollToSettle(cdp);
        await sleep(500);
        await saveScreenshot(cdp,`desktop-${section}`);
      }
    }
    await verifyHealthy(cdp,`${name} appearance`);
    delete state.text;
    checks.push({viewport,contrasts,styles:state,typedName:"Browser Readability Check"});
  }
  await verifyInteractions();
  const report = {passed:true,checks};
  await writeFile(".background-verification/appearance.json",JSON.stringify(report,null,2));
  console.log(JSON.stringify({passed:true,appearance:checks.map(({viewport,contrasts,typedName})=>({viewport,contrasts,typedName}))},null,2));
}

try {
  progress("Starting headless Chrome");
  await until(async () => {
    try { return (await fetch(`http://localhost:${port}/json/version`)).ok; }
    catch { return false; }
  }, Boolean, `Chrome started: ${browserOutput}`, 15_000);

  if (process.argv.includes("--appearance-only")) {
    await verifyAppearanceOnly();
  } else if (process.argv.includes("--ui-only")) {
    await verifyInteractions();
    console.log(JSON.stringify({passed:true,results},null,2));
  } else if (process.argv.includes("--touch-only")) {
    await verifyMobileTouch();
    console.log(JSON.stringify({passed:true,results},null,2));
  } else {

  progress("Desktop first frame and forward/reverse scrolling");
  const desktop = await connect();
  await desktop.send("Emulation.setDeviceMetricsOverride", { width: 1365, height: 768, deviceScaleFactor: 1, mobile: false });
  await desktop.send("Page.navigate", { url: origin });
  const first = await until(() => snapshot(desktop), (state) => state.last && frameNumber(state.last.src) === 0, "First frame appears");
  verifyCanvas(first, "desktop first frame");
  for (const progress of [0.5, 1, 0.25, 0]) {
    verifyCanvas(await scrollToFrame(desktop, progress), `desktop scroll ${progress}`);
  }
  progress("Rapid scrolling, wheel, keyboard, and desktop navigation");
  await desktop.evaluate(`(async () => {
    const range = document.documentElement.scrollHeight - innerHeight;
    for (const fraction of [0.8, 0.05, 1, 0.1, 0.95, 0]) {
      scrollTo({top: range*fraction, behavior:"instant"});
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
  })()`);
  verifyCanvas(await scrollToFrame(desktop, 1), "rapid scroll settles at last frame");
  await scrollToFrame(desktop, 0);
  await desktop.send("Input.dispatchMouseEvent", {type:"mouseWheel",x:700,y:400,deltaX:0,deltaY:550});
  await until(() => desktop.evaluate("scrollY"), (y) => y > 200,"Mouse wheel scrolling works");
  await sleep(1250);
  const beforeKeyboard = await desktop.evaluate("scrollY");
  await desktop.send("Input.dispatchKeyEvent", {type:"keyDown",key:"PageDown",code:"PageDown",windowsVirtualKeyCode:34});
  await desktop.send("Input.dispatchKeyEvent", {type:"keyUp",key:"PageDown",code:"PageDown",windowsVirtualKeyCode:34});
  await until(() => desktop.evaluate("scrollY"), (y) => y > beforeKeyboard+100,"Keyboard scrolling works");
  await waitForScrollToSettle(desktop);
  verifyCanvas(await snapshot(desktop),"wheel and keyboard scrolling");
  await scrollToFrame(desktop, 0);
  await click(desktop, 'header a[href="#about"]');
  await until(() => desktop.evaluate("scrollY"), (y) => y > 200, "Desktop navigation scrolls");
  await waitForScrollToSettle(desktop);
  for (const viewport of [
    {width:390, height:844, deviceScaleFactor:3, mobile:true},
    {width:844, height:390, deviceScaleFactor:3, mobile:true},
    {width:768, height:1024, deviceScaleFactor:2, mobile:true},
    {width:1440, height:900, deviceScaleFactor:2, mobile:false},
  ]) {
    progress(`Responsive ${viewport.width}x${viewport.height} at DPR ${viewport.deviceScaleFactor}`);
    await desktop.send("Emulation.setDeviceMetricsOverride", viewport);
    await sleep(250);
    verifyCanvas(await scrollToFrame(desktop, 0.5), `${viewport.width}x${viewport.height} DPR ${viewport.deviceScaleFactor}`);
    if (viewport.width === 390) {
      await scrollToFrame(desktop, 0);
      await click(desktop, 'button[aria-label="Toggle menu"]');
      await until(() => desktop.evaluate("document.documentElement.classList.contains('noscroll')"), Boolean, "Mobile menu opens");
      await sleep(300);
      await click(desktop, 'button[aria-label="Close menu"]');
      await until(() => desktop.evaluate("document.documentElement.classList.contains('noscroll')"), (open) => !open, "Mobile menu closes");
    }
  }
  progress("Rapid resizing and idle decoded-cache activity");
  for (const width of [1000, 1100, 500, 1200, 800]) {
    await desktop.send("Emulation.setDeviceMetricsOverride", {width,height:700,deviceScaleFactor:2,mobile:false});
  }
  await sleep(250);
  verifyCanvas(await scrollToFrame(desktop, 1), "rapid resize settles");
  await scrollToFrame(desktop, 0);
  await sleep(500);
  const idleBefore = await snapshot(desktop);
  await sleep(1000);
  const idleAfter = await snapshot(desktop);
  assert(idleAfter.bitmapCalls-idleBefore.bitmapCalls <= 4,"Decoded cache settles while idle without repeated decode/eviction");
  assert(idleAfter.rafCallbacks-idleBefore.rafCallbacks <= 4,"The page stops animation frame callbacks while idle");
  await mkdir(".background-verification", {recursive:true});
  const screenshot = await desktop.send("Page.captureScreenshot", {format:"png"});
  await writeFile(".background-verification/desktop.png", Buffer.from(screenshot.data,"base64"));
  await verifyHealthy(desktop, "desktop and responsive");
  results.push({scenario:"desktop, reverse and rapid scroll, responsive, navigation",firstFrameTime:first.last.time,frameCount:files.length,
    draws:idleAfter.draws,bitmapBytes:idleAfter.bitmapBytes,peakBitmapBytes:idleAfter.peakBitmapBytes,idleBitmapCalls:idleAfter.bitmapCalls-idleBefore.bitmapCalls,idleAnimationCallbacks:idleAfter.rafCallbacks-idleBefore.rafCallbacks});

  await verifyMobileTouch();

  progress("Reduced motion preference");
  const reduced = await connect();
  await reduced.send("Emulation.setDeviceMetricsOverride", {width:1280,height:720,deviceScaleFactor:2,mobile:false});
  await reduced.send("Emulation.setEmulatedMedia", {features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  await reduced.send("Page.navigate", {url:origin});
  await until(() => snapshot(reduced), (state) => Boolean(state.last), "Reduced motion initially draws");
  assert.equal(await reduced.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches"),true,"Reduced motion media preference is active");
  assert.equal(await reduced.evaluate("getComputedStyle(document.documentElement).scrollBehavior"),"auto","Reduced motion disables CSS smooth scrolling");
  assert.equal(await reduced.evaluate("document.documentElement.classList.contains('lenis')"),false,"Reduced motion avoids the Lenis smoothing loop");
  for (const fraction of [1,0,0.5]) {
    await reduced.evaluate(`scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*${fraction},behavior:"instant"})`);
    await sleep(150);
    const pending = await snapshot(reduced);
    verifyCanvas(pending, "reduced motion during frame preparation");
    assert.equal(Number(pending.data.targetFrameIndex),0,"Reduced motion keeps a static background");
    assert.equal(frameNumber(pending.last.src),0,"Reduced motion continues showing frame zero");
    assert.equal(Number(pending.data.loadedFrameCount),1,"Reduced motion avoids sequence prefetching");
  }
  await reduced.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"no-preference"}]});
  verifyCanvas(await scrollToFrame(reduced,0.5),"Removing reduced motion resumes the current scroll frame");
  await reduced.send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  await until(()=>snapshot(reduced),state=>frameNumber(state.last.src)===0,"Enabling reduced motion restores the still frame");
  await verifyHealthy(reduced,"reduced motion");
  results.push({scenario:"prefers-reduced-motion",draws:(await snapshot(reduced)).draws});

  progress("Failed middle frame falls back and later frames still render");
  const failed = await connect();
  const failureIndex = Math.round((files.length-1)*0.5);
  let failedRequests = 0;
  await failed.send("Fetch.enable", {patterns:[{urlPattern:"*/images/Background/*",requestStage:"Request"}]});
  failed.on("Fetch.requestPaused", async (request) => {
    if (frameNumber(request.request.url) === failureIndex) {
      failedRequests++;
      await failed.send("Fetch.failRequest", {requestId:request.requestId,errorReason:"Failed"});
    } else await failed.send("Fetch.continueRequest", {requestId:request.requestId});
  });
  await failed.send("Page.navigate", {url:origin});
  await until(() => snapshot(failed), (state) => Boolean(state.last), "Error scenario initially draws");
  await failed.evaluate("scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*0.5,behavior:'instant'})");
  const fallback = await until(() => snapshot(failed), (state) => state.last && Math.abs(frameNumber(state.last.src)-failureIndex) === 1,
    "Failed middle frame uses a loaded adjacent frame");
  assert(failedRequests > 0,"Failure was actually injected");
  verifyCanvas(fallback,"failed-frame fallback");
  verifyCanvas(await scrollToFrame(failed,1),"failed frame does not stop later frames");
  await verifyHealthy(failed,"failed frame");
  results.push({scenario:"failed middle frame",failedIndex:failureIndex,fallbackIndex:frameNumber(fallback.last.src)});

  progress("Delayed image loading preserves a valid frame while scrolling");
  const delayed = await connect();
  await delayed.send("Fetch.enable", {patterns:[{urlPattern:"*/images/Background/*",requestStage:"Request"}]});
  let delayedRequests = 0;
  delayed.on("Fetch.requestPaused", async (request) => {
    if (frameNumber(request.request.url) > 0) { delayedRequests++; await sleep(500); }
    await delayed.send("Fetch.continueRequest", {requestId:request.requestId});
  });
  await delayed.send("Page.navigate", {url:origin});
  const delayedFirst = await until(() => snapshot(delayed), (state) => state.last && frameNumber(state.last.src) === 0,"First frame displays before delayed sequence");
  await delayed.evaluate("scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})");
  await sleep(100);
  verifyCanvas(await snapshot(delayed),"scroll during delayed image loading keeps previous valid frame");
  verifyCanvas(await scrollToFrame(delayed,1,files.length-1,20_000),"delayed sequence catches up to target");
  assert(delayedRequests > 0,"Image delays were actually injected");
  await verifyHealthy(delayed,"delayed loading");
  results.push({scenario:"delayed images and scrolling before ready",delayedRequests,firstFrameTime:delayedFirst.last.time});
  await writeFile(".background-verification/results.json",JSON.stringify(results,null,2));
  console.log(JSON.stringify({passed:true,results},null,2));
  }
} catch (error) {
  console.error(error);
  let state = activeSession?.lastSnapshot;
  if (activeSession) {
    try { state = await snapshot(activeSession); } catch { /* Report the most recent successful snapshot. */ }
  }
  console.error(JSON.stringify({scenario,state,runtimeErrors:activeSession?.runtimeErrors,consoleErrors:activeSession?.consoleErrors},null,2));
  process.exitCode = 1;
} finally {
  for (const session of sessions) {
    try { await fetch(`http://localhost:${port}/json/close/${session.target}`); } catch { /* Chrome may have exited. */ }
    session.close();
  }
  child.kill();
  await sleep(750);
  // Delete only the exact temporary profile created by this script.
  if (path.dirname(profile) === path.resolve(tmpdir()) && path.basename(profile).startsWith("portfolio-background-test-")) {
    await rm(profile,{recursive:true,force:true,maxRetries:4,retryDelay:250}).catch(() => {});
  }
}
