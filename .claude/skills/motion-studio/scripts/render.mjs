#!/usr/bin/env node
// motion-studio renderer: drives a deterministic HTML scene in headless Chromium and encodes it with ffmpeg.
//
// A scene page must expose:
//   window.ready            -> set to true once fonts/assets are loaded
//   window.grab(frame)      -> data URL (image/jpeg or image/png) of that frame, pure function of `frame`
//   window.META (optional)  -> { fps, frames }
//   window.cues() (optional)-> JSON of sound cues (impact times etc.), written by `cues`
//
// Usage:
//   node render.mjs stills <scene.html> <out-dir> <frame> [frame ...]   [--q "w=960&h=540"]
//   node render.mjs sheet  <stills-dir> <out.jpg> [--cols 4] [--w 480]
//   node render.mjs video  <scene.html> <out.mp4> [--frames N] [--fps 24] [--jobs 2] [--q ...] [--crf 18] [--gl]
//   node render.mjs cues   <scene.html> <out.json>
//   node render.mjs mux    <video.mp4> <audio.wav> <out.mp4>
//   node render.mjs probe  <file.mp4>                      (duration, streams, loudness)
//
// --gl  launches Chromium with SwiftShader WebGL flags (needed for three.js / shader scenes on GPU-less machines).
// The scene's folder is served over a local HTTP server so ES modules and fetch() work.
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const flag = k => { const i = args.indexOf('--' + k); if (i < 0) return false; args.splice(i, 1); return true; };

export function ffmpegPath() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  if (spawnSync('ffmpeg', ['-version']).status === 0) return 'ffmpeg';
  // pip-installed static build (python -m pip install imageio-ffmpeg)
  const r = spawnSync('python3', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']);
  const p = r.stdout?.toString().trim(); if (r.status === 0 && p) return p;
  const r2 = spawnSync('python', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']);
  const p2 = r2.stdout?.toString().trim(); if (r2.status === 0 && p2) return p2;
  throw new Error('ffmpeg not found. Run scripts/doctor.mjs for install steps.');
}
function loadPlaywright() {
  for (const m of ['playwright', 'playwright-core']) { try { return require(m); } catch {} }
  const globalRoot = spawnSync('npm', ['root', '-g'], { shell: process.platform === 'win32' }).stdout?.toString().trim();
  for (const m of ['playwright', 'playwright-core']) { try { return require(path.join(globalRoot, m)); } catch {} }
  throw new Error('playwright not found. Run scripts/doctor.mjs for install steps.');
}
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.wasm': 'application/wasm' };
function serve(root) {
  return new Promise(res => {
    const srv = createServer((req, rsp) => {
      const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { rsp.writeHead(404); return rsp.end(); }
      rsp.writeHead(200, { 'content-type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream' }); fs.createReadStream(p).pipe(rsp);
    }).listen(0, '127.0.0.1', () => res(srv));
  });
}
async function openScene(scene, q, gl) {
  const { chromium } = loadPlaywright();
  const root = path.resolve(path.dirname(scene)); const srv = await serve(root);
  const launchArgs = gl ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : [];
  const browser = await chromium.launch({ args: launchArgs });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', e => { console.error('[scene error]', e.message); process.exitCode = 1; });
  page.on('console', m => { if (m.type() === 'error') console.error('[scene console]', m.text()); });
  await page.goto(`http://127.0.0.1:${srv.address().port}/${path.basename(scene)}${q ? '?' + q : ''}`);
  await page.waitForFunction(() => window.ready === true, null, { timeout: 120000, polling: 200 });
  const meta = await page.evaluate(() => window.META || null);
  return { page, meta, close: async () => { await browser.close(); srv.close(); } };
}
const toBuf = d => Buffer.from(d.slice(d.indexOf(',') + 1), 'base64');

async function renderRange(scene, out, a, b, fps, q, gl, crf) {
  const s = await openScene(scene, q, gl);
  const ff = spawn(ffmpegPath(), ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let f = a; f < b; f++) {
    const d = await s.page.evaluate(f => window.grab(f), f);
    if (!ff.stdin.write(toBuf(d))) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - a) % 48 === 0) console.log(`${path.basename(out)} frame ${f}/${b} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await s.close();
}

// parse every option before reading positionals, so trailing flags are never taken as frame numbers
const q = opt('q', ''), gl = flag('gl'), JOBS = +opt('jobs', 2), CRF = +opt('crf', 18), FPS_OPT = opt('fps'), FRAMES_OPT = opt('frames'), COLS = +opt('cols', 4), SHEET_W = +opt('w', 480);
const [cmd, ...rest] = args;
if (cmd === 'stills') {
  const [scene, dir, ...frames] = rest; fs.mkdirSync(dir, { recursive: true });
  const s = await openScene(scene, q, gl);
  for (const f of frames.map(Number)) { const t = Date.now(); const d = await s.page.evaluate(f => window.grab(f), f);
    fs.writeFileSync(path.join(dir, `f${String(f).padStart(5, '0')}.${d.startsWith('data:image/png') ? 'png' : 'jpg'}`), toBuf(d)); console.log(`frame ${f}: ${Date.now() - t} ms`); }
  await s.close();
} else if (cmd === 'sheet') {
  const [dir, out] = rest; const cols = COLS, w = SHEET_W;
  const files = fs.readdirSync(dir).filter(f => /\.(jpg|png)$/.test(f)).sort(); const rows = Math.ceil(files.length / cols);
  const list = path.join(dir, '_list.txt'); fs.writeFileSync(list, files.map(f => `file '${path.resolve(dir, f).replace(/'/g, "'\\''")}'`).join('\n'));
  spawnSync(ffmpegPath(), ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-vf', `scale=${w}:-2,tile=${cols}x${rows}`, '-frames:v', '1', out], { stdio: 'inherit' });
  fs.unlinkSync(list); console.log('sheet ->', out);
} else if (cmd === 'video') {
  const [scene, out] = rest; const jobs = JOBS, crf = CRF;
  const s = await openScene(scene, q, gl); const meta = s.meta || {}; await s.close();
  const fps = +(FPS_OPT ?? meta.fps ?? 24), frames = +(FRAMES_OPT ?? meta.frames ?? 0);
  if (!frames) throw new Error('frame count unknown: pass --frames or set window.META.frames');
  const per = Math.ceil(frames / jobs), parts = [];
  await Promise.all(Array.from({ length: jobs }, (_, j) => { const a = j * per, b = Math.min(frames, a + per); if (a >= b) return;
    const p = `${out}.part${j}.mp4`; parts.push(p); return renderRange(scene, p, a, b, fps, q, gl, crf); }));
  parts.sort(); const list = `${out}.parts.txt`; fs.writeFileSync(list, parts.map(p => `file '${path.resolve(p)}'`).join('\n'));
  spawnSync(ffmpegPath(), ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', out], { stdio: 'inherit' });
  parts.forEach(p => fs.unlinkSync(p)); fs.unlinkSync(list); console.log('video ->', out);
} else if (cmd === 'cues') {
  const [scene, out] = rest; const s = await openScene(scene, q, gl);
  fs.writeFileSync(out, JSON.stringify(await s.page.evaluate(() => window.cues ? window.cues() : {}), null, 1)); await s.close(); console.log('cues ->', out);
} else if (cmd === 'mux') {
  const [video, audio, out] = rest;
  spawnSync(ffmpegPath(), ['-y', '-loglevel', 'error', '-i', video, '-i', audio, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '224k', '-shortest', '-movflags', '+faststart', out], { stdio: 'inherit' });
  console.log('muxed ->', out);
} else if (cmd === 'probe') {
  const [file] = rest; const r = spawnSync(ffmpegPath(), ['-hide_banner', '-i', file, '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' });
  console.log(r.stderr.split('\n').filter(l => /Duration|Stream|mean_volume|max_volume/.test(l)).map(l => l.replace(/^.*\] /, '').trim()).join('\n'));
} else {
  console.log(fs.readFileSync(new URL(import.meta.url)).toString().split('\n').filter(l => l.startsWith('//')).join('\n'));
}
