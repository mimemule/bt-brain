// motion-studio rig: jointed stylised figures, keyframed poses, and a contact solver.
//
// Local frame of a figure: faces +Z, up +Y, its LEFT is +X. Root origin is at the FEET (y = 0 standing),
// so a lying figure needs root y ~ 0.1-0.2, not negative (a past bug put a figure under the floor).
// Joint rotations are degrees [rx, ry, rz], Euler order YXZ. Useful signs (limbs hang down in rest pose):
//   shoulder rx < 0 raises the arm forward; lSh rz > 0 / rSh rz < 0 lifts the arm out to the side
//   elbow rx < 0 bends the forearm up/forward; hip rx < 0 lifts the leg forward; knee rx > 0 bends it back
//   spine/chest rx > 0 lean forward; head rx < 0 tilts back; hips ry < 0 turns the left shoulder forward
import * as THREE from 'three';

export const JOINTS = ['hips', 'spine', 'chest', 'neck', 'head', 'lSh', 'lEl', 'rSh', 'rEl', 'lHip', 'lKn', 'lAn', 'rHip', 'rKn', 'rAn'];
const D = Math.PI / 180, clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, t) => a + (b - a) * t;
export const EASE = { lin: t => t, io: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, out: t => 1 - Math.pow(1 - t, 3), in: t => t * t * t, snap: t => 1 - Math.pow(1 - t, 5) };

// materials: { armor, under, glow } (any THREE materials). Returns a Group with userData.J = joints.
export function buildFigure(scene, materials) {
  const { armor, under, glow } = materials, J = {}, root = new THREE.Group(); root.rotation.order = 'YXZ';
  const mesh = (geo, mat, parent, pos = [0, 0, 0], rot = [0, 0, 0], scl = [1, 1, 1]) => { const m = new THREE.Mesh(geo, mat); m.position.set(...pos); m.rotation.set(...rot); m.scale.set(...scl); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  const joint = (name, parent, pos) => { const g = new THREE.Group(); g.position.set(...pos); g.rotation.order = 'YXZ'; parent.add(g); J[name] = g; return g; };
  const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 6, 14);
  const hips = joint('hips', root, [0, 1.0, 0]); mesh(new THREE.BoxGeometry(.34, .16, .2), under, hips, [0, -.02, 0]);
  const spine = joint('spine', hips, [0, .06, 0]); mesh(cap(.09, .16), under, spine, [0, .12, 0]);
  const chest = joint('chest', spine, [0, .24, 0]);
  mesh(cap(.17, .14), armor, chest, [0, .14, .01], [0, 0, Math.PI / 2], [1, 1, .72]); mesh(new THREE.BoxGeometry(.2, .018, .012), glow, chest, [0, .15, .145]);
  const neck = joint('neck', chest, [0, .3, 0]); mesh(cap(.045, .05), under, neck, [0, .04, 0]);
  const head = joint('head', neck, [0, .09, 0]);
  mesh(new THREE.SphereGeometry(.115, 24, 18), armor, head, [0, .09, 0], [0, 0, 0], [.92, 1.08, 1]); mesh(new THREE.BoxGeometry(.17, .032, .05), glow, head, [0, .1, .085]);
  for (const [s, k] of [['l', 1], ['r', -1]]) {
    const sh = joint(s + 'Sh', chest, [k * .23, .22, 0]); mesh(new THREE.SphereGeometry(.09, 16, 12), armor, sh, [k * .02, .02, 0], [0, 0, 0], [1.1, .8, 1]);
    mesh(cap(.058, .26), armor, sh, [0, -.18, 0]);
    const el = joint(s + 'El', sh, [0, -.36, 0]); mesh(cap(.052, .23), armor, el, [0, -.16, 0]); mesh(new THREE.BoxGeometry(.03, .17, .012), glow, el, [0, -.15, .052]);
    const hand = joint(s + 'Hand', el, [0, -.35, 0]); mesh(new THREE.BoxGeometry(.1, .1, .11), armor, hand, [0, -.02, 0]);
    const hip = joint(s + 'Hip', hips, [k * .11, -.06, 0]); mesh(cap(.08, .26), under, hip, [0, -.2, 0]);
    const kn = joint(s + 'Kn', hip, [0, -.44, 0]); mesh(cap(.065, .28), armor, kn, [0, -.2, 0]); mesh(new THREE.BoxGeometry(.02, .2, .012), glow, kn, [0, -.2, .066]);
    const an = joint(s + 'An', kn, [0, -.44, 0]); mesh(new THREE.BoxGeometry(.11, .07, .24), armor, an, [0, -.03, .05]);
  }
  root.userData.J = J; scene.add(root); return root;
}

// Pose keys: [time, poseObject, ease]; root keys: [time, {x, y, z, spin, rx}, ease]. heading = base yaw in degrees.
function sample(keys, t) { let i = 0; while (i < keys.length - 1 && keys[i + 1][0] <= t) i++; const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  return [a[1], b[1], b === a ? 0 : (EASE[b[2] || 'io'])(clamp((t - a[0]) / (b[0] - a[0])))]; }
const DEF = { x: 0, y: 0, z: 0, spin: 0, rx: 0 };
export function animate(fig, poseKeys, rootKeys, heading, t, corrections = []) {
  const J = fig.userData.J, [a, b, p] = sample(poseKeys, t);
  for (const j of JOINTS) { const va = a[j] || [0, 0, 0], vb = b[j] || [0, 0, 0]; J[j].rotation.set(lerp(va[0], vb[0], p) * D, lerp(va[1], vb[1], p) * D, lerp(va[2], vb[2], p) * D); }
  const [ra, rb, rp] = sample(rootKeys, t), g = k => lerp(ra[k] ?? DEF[k], rb[k] ?? DEF[k], rp);
  let cx = 0, cz = 0; for (const [c, dx, dz] of corrections) { const w = Math.exp(-Math.pow((t - c) / .16, 2)); cx += dx * w; cz += dz * w; }
  fig.position.set(g('x') + cx, g('y') + lerp(a.y || 0, b.y || 0, p), g('z') + cz);
  fig.rotation.set(g('rx') * D, (heading + g('spin')) * D, 0);
}
export function worldPos(fig, joint, offset = [0, 0, 0]) { fig.updateMatrixWorld(true); return fig.userData.J[joint].getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(...offset)); }

// Contact solver: for each hit {t, fig, effector, target: () => Vector3}, nudges the attacker's root with a smooth
// lunge bump so the effector lands on the target. Horizontal only; fix heights by editing poses and re-measuring.
export function solveContacts(hits, poseAt, corrections, iterations = 4) {
  for (let it = 0; it < iterations; it++) for (const h of hits) { poseAt(h.t); const e = worldPos(h.fig, h.effector), tg = h.target();
    corrections.get(h.fig).push([h.t, (tg.x - e.x) * .9, (tg.z - e.z) * .9]); }
  return hits.map(h => { poseAt(h.t); const e = worldPos(h.fig, h.effector), tg = h.target(); return { t: h.t, effector: h.effector, miss_m: +e.distanceTo(tg).toFixed(3), dy: +(tg.y - e.y).toFixed(3) }; });
}
