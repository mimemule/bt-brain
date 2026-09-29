#!/usr/bin/env node
// motion-studio doctor: checks every dependency and prints the exact fix for anything missing.
// Read-only - it never installs anything itself. Run: node doctor.mjs
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(import.meta.url);
const win = process.platform === 'win32';
const run = (c, a) => { const r = spawnSync(c, a, { encoding: 'utf8', shell: win && c === 'npm' }); return r.status === 0 ? (r.stdout || r.stderr || '').trim() : null; };
const rows = [];
const check = (name, ok, detail, fix) => rows.push({ name, ok, detail, fix });

const [maj] = process.versions.node.split('.').map(Number);
check('Node.js >= 18', maj >= 18, process.version, win ? 'winget install OpenJS.NodeJS.LTS' : 'install Node 18+ (nvm install --lts)');

let pw = null; for (const m of ['playwright', 'playwright-core']) { try { pw = require(m); break; } catch {} }
if (!pw) { const g = run('npm', ['root', '-g']); if (g) for (const m of ['playwright', 'playwright-core']) { try { pw = require(path.join(g, m)); break; } catch {} } }
check('Playwright', !!pw, pw ? 'found' : 'missing', 'npm install -g playwright');
let chromeOk = false, chromeDetail = 'not checked';
if (pw) { try { const p = pw.chromium.executablePath(); chromeOk = !!p && require('node:fs').existsSync(p); chromeDetail = p || 'none'; } catch (e) { chromeDetail = e.message.split('\n')[0]; } }
check('Chromium for Playwright', chromeOk, chromeDetail, process.env.PLAYWRIGHT_BROWSERS_PATH ? 'preinstalled browsers path set but Chromium missing - check PLAYWRIGHT_BROWSERS_PATH' : 'npx playwright install chromium');

let ff = run('ffmpeg', ['-version']); let ffSrc = 'system';
if (!ff) { const p = run(win ? 'python' : 'python3', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']); if (p) { ff = p; ffSrc = 'imageio-ffmpeg: ' + p; } }
check('ffmpeg (with libx264)', !!ff, ff ? ffSrc : 'missing', win ? 'winget install Gyan.FFmpeg   (or: python -m pip install imageio-ffmpeg)' : 'python3 -m pip install imageio-ffmpeg   (or your package manager)');

const py = run(win ? 'python' : 'python3', ['-c', 'import numpy;print(numpy.__version__)']);
check('Python + numpy (sound design)', !!py, py ? 'numpy ' + py : 'missing', `${win ? 'python' : 'python3'} -m pip install numpy`);

const w = Math.max(...rows.map(r => r.name.length));
for (const r of rows) console.log(`${r.ok ? '[ok]  ' : '[MISS]'} ${r.name.padEnd(w)}  ${r.detail}${r.ok ? '' : `\n        fix: ${r.fix}`}`);
console.log('\nOptional: three.js scenes install three on demand -> cd <scene dir> && npm install (package.json pins the version).');
process.exitCode = rows.every(r => r.ok) ? 0 : 1;
