// hero-3d.html → 2560x1440 mp4. Not a screen recording: frames come straight out of a
// headless Chrome over CDP, so nothing depends on this machine keeping 30fps.
//
// The trick is the same one pack-proto/render.mjs uses, inverted from Chrome's virtual time
// (which does not carry CSS animations — it duplicates whole frames). Instead the PAGE is
// run SLOW times slower and screenshots are taken every 1/FPS * SLOW of wall clock: the
// capture can take 200ms and still not fall behind a 33ms frame.
//   - CSS animations are slowed by Animation.setPlaybackRate, which is global and needs no
//     cooperation from the page.
//   - <video> has its own clock that that rate does not touch, so each clip's playbackRate
//     is set to match. Without this the footage inside the cards runs 8x fast in the export.
//   - setTimeout is NOT slowed, on purpose: the video-loading stagger in the page is a
//     network concern, and at slow motion it gets even more head start than it needs.
//
// Layout runs at the authored 1920x1080 and the device scale factor does the 2K, so text and
// gradients are rendered at 2560 rather than upscaled from 1920.
//
//   node render-2k.mjs            → out/hero-3d-2k.mp4 + out/hero-3d-2k.png
//   SECS=12 SLOW=10 node render-2k.mjs
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, readdirSync } from 'node:fs';

const FPS   = +(process.env.FPS  || 30);
const SECS  = +(process.env.SECS || 15);
// 12, not 8: a 2560x1440 PNG capture costs ~810ms and even JPEG costs ~320, so the wall
// budget per frame (1/FPS * SLOW) has to clear that or every frame lands late and the export
// silently becomes a fast-forward — the page advances by however long the capture took, not
// by one frame. 1/12 also stays above the 0.0625 floor Chrome clamps playbackRate to.
const SLOW  = +(process.env.SLOW || 15);
const W = 1920, H = 1080, DPR = 2560 / 1920;   // 2560x1440
const PORT  = +(process.env.PORT || 9413);
const HTTP  = +(process.env.HTTP || 8817);
const ROOT  = new URL('.', import.meta.url).pathname;
const TMP   = process.env.TMP_DIR || '/tmp/hero3d-frames';
const OUT   = ROOT + 'out';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = ms => new Promise(r => setTimeout(r, ms));

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
mkdirSync(OUT, { recursive: true });

// The page has to be served, not opened as a file: a dozen <video> elements on file:// get
// no useful concurrency and half of them never reach readyState 1.
const server = spawn('python3', ['-m', 'http.server', String(HTTP), '--directory', ROOT], { stdio: 'ignore' });

const chrome = spawn(CHROME, [
  '--headless=new', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${TMP}-profile`,
  '--hide-scrollbars', '--force-color-profile=srgb', '--disable-lcd-text',
  '--autoplay-policy=no-user-gesture-required',
  '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding',
  '--run-all-compositor-stages-before-draw', '--disable-new-content-rendering-timeout',
  `--window-size=${W},${H}`, '--no-first-run', '--no-default-browser-check',
], { stdio: 'ignore' });

let targets;
for (let i = 0; i < 80; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); if (targets.length) break; } catch {}
  await sleep(250);
}
const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));

let id = 0;
const pending = new Map(), waiters = new Map();
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m.error); pending.delete(m.id); }
  if (m.method && waiters.has(m.method)) { waiters.get(m.method)(); waiters.delete(m.method); }
});
const send = (method, params = {}) =>
  new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const once = m => Promise.race([
  new Promise(r => waiters.set(m, r)),
  sleep(30000).then(() => { throw new Error('timeout: ' + m); }),
]);

await send('Page.enable');
await send('Animation.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: DPR, mobile: false });

// Before navigating, so the very first frames of the entrance are already in slow motion —
// set after load, the left end of the wave would have run at full speed and be gone.
await send('Animation.setPlaybackRate', { playbackRate: 1 / SLOW });
// Videos are created by the page's own script, so this keeps re-applying rather than doing
// one pass. Cheap, and it also catches clips that arrive late.
await send('Page.addScriptToEvaluateOnNewDocument', { source: `
  setInterval(function () {
    document.querySelectorAll('video').forEach(function (v) {
      if (v.playbackRate !== ${1 / SLOW}) v.playbackRate = ${1 / SLOW};
      if (v.paused && v.src) v.play().catch(function () {});
    });
  }, 250);
` });

await send('Page.navigate', { url: `http://127.0.0.1:${HTTP}/hero-3d.html` });
await once('Page.loadEventFired');
await send('Animation.setPlaybackRate', { playbackRate: 1 / SLOW });

const total = Math.round(FPS * SECS);
const t0 = Date.now();
let late = 0;
for (let f = 0; f < total; f++) {
  const due = t0 + f * (1000 / FPS) * SLOW;
  const wait = due - Date.now();
  if (wait > 0) await sleep(wait); else late++;
  // JPEG at 100 rather than PNG: 320ms a frame instead of 810, and the luma is effectively
  // lossless. Everything here goes through 4:2:0 h264 at the end anyway.
  const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 100, captureBeyondViewport: false });
  writeFileSync(`${TMP}/f${String(f).padStart(5, '0')}.jpg`, Buffer.from(shot.data, 'base64'));
  if (f % 30 === 0) console.log(`  ${f}/${total}   ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
console.log(`frames: ${readdirSync(TMP).length}, late ${late}/${total}`);
// The poster still is worth a real PNG — it is one frame, so the 810ms does not matter.
const still = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
writeFileSync(`${OUT}/hero-3d-2k.png`, Buffer.from(still.data, 'base64'));
ws.close(); chrome.kill(); server.kill();

const run = (cmd, args) => new Promise((res, rej) => {
  const p = spawn(cmd, args, { stdio: 'inherit' });
  p.on('exit', c => c === 0 ? res() : rej(new Error(cmd + ' exit ' + c)));
});
// Fade to black over the last 1.6s. The clip opens on black with nothing in the field yet,
// so a black tail is what makes a loop join without a cut.
const FADE = +(process.env.FADE || 1.6);
await run('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', `${TMP}/f%05d.jpg`,
  '-vf', `fade=t=out:st=${(SECS - FADE).toFixed(2)}:d=${FADE}`,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart', `${OUT}/hero-3d-2k.mp4`]);
rmSync(TMP, { recursive: true, force: true });
rmSync(TMP + '-profile', { recursive: true, force: true });
console.log('→ ' + OUT + '/hero-3d-2k.mp4');
