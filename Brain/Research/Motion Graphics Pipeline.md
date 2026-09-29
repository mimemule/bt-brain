---
type: research
domain: Motion graphics / code-driven video
used_by: .claude/skills/motion-studio
last_verified: 2026-09-29
---

# Motion Graphics Pipeline: findings

Durable findings from building code-rendered video (2D motion graphics, cinematic 2D, ray-marched 3D, three.js
character scenes) in a GPU-less cloud container, September 2026. The procedure lives in the `motion-studio`
skill; this note holds the evidence. **Cite, don't restate.**

## Rendering speed (environment-dependent - re-check if the machine changes; measured 2026-09)

Headless Chromium 1194 with SwiftShader (the CPU emulates the GPU), 4 cores:

| Scene type | 1080p cost per frame | Notes |
|---|---|---|
| Canvas 2D, 4 motion-blur sub-frames | ~0.1-0.2 s | 8 s at 30 fps rendered in 21 s with 2 jobs |
| Canvas 2D at 4K with bloom and grain | ~0.7 s per job | 75 s at 24 fps took ~8 min with 3 jobs |
| Ray-marched metal, 1 reflection bounce | ~3-4 s alone, ~7 s effective with 3 jobs | parallel jobs contend for the same emulated GPU |
| Ray-marched at 1.5x supersampling | ~6 s alone | 384-frame loop took ~40 min |
| three.js, shadows + bloom, 3 sub-frames | ~1.5-2.5 s | 15 s at 24 fps took ~15 min with 2 jobs |

- Parallel browser jobs speed up CPU-bound 2D scenes; for emulated-GPU scenes, more than 2 jobs gains little.
- WebGL2 with float render targets and 8K textures is available; WebGPU is not.

## Correctness traps (craft findings - do not decay)

1. **Global function shadowing.** In a classic `<script>`, `function renderFrame(){}` *is* `window.renderFrame`.
   Assigning a wrapper to `window.renderFrame` that calls `renderFrame()` recurses until the stack overflows.
2. **Background colour match.** A shader that treats an sRGB hex value as linear outputs a lighter colour, which
   shows as a pale rectangle on the page. Convert with `pow(c, 2.2)` and return the exact colour for pure
   background pixels; this measured exactly 245/240/229 for `#F5F0E5`. H.264 then shifts it by 1-2 levels
   (244/238/228), so feather the video's edges with a CSS mask.
3. **Ray-march bounds.** An early-out like `if (outside) return d;` lets the ray step straight past thin rings,
   which then render as broken fragments. Return `min(d, boundDistance)`.
4. **Figure root at the feet.** Setting a lying figure's root to y = -0.78 (as if the origin were at the hips)
   put the whole body under the floor. Lying root y is ~0.1-0.2.
5. **Contact.** Hand-placed strikes missed their targets by 0.9-1.9 m. A solver that nudges the attacker's root
   with a smooth Gaussian bump (sigma 0.16 s) over 4 iterations brought horizontal error to ~0.02 m. Heights still
   need pose edits: measure, change the arm angle, and measure again.
6. **Bloom on white.** Near-white clearcoat armour with a bloom threshold of 0.82 blew out whole frames. Use a
   threshold of 0.9+ and grey-white (0x9aa3ae).
7. **CLI flags.** Parse options *before* positional arguments, or a trailing `--gl` is read as a frame number.
8. **Audio balance.** A 36.7 Hz sub-drone at gain 0.35 masked everything else; check RMS per 3 s window
   (`Mix.report()`) rather than trusting gains. Master gain automation is the clean fix for quiet middle acts.
9. **Seamless loops.** Drive every motion by whole turns of a phase in [0,1); frame N then equals frame 0 exactly.

## Limits of the approach

- Stylised, graphic, typographic and mechanical subjects work well. Photoreal people, places and organic
  textures do not; that would need AI-generated or filmed footage.
- Hand-keyframed characters read as stiff: no motion capture, no foot locking, and some body overlap at close
  range. The next step up is mocap data or IK foot planting.
- Chat file transfer is capped at ~30 MB (a 75 s 4K master was 167 MB).
