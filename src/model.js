import * as THREE from 'three';
import {buildInteractiveKeyboards} from './keyboards.js';
import {surfaceOverlay} from './render-stability.js';
import {buildGallery} from './gallery.js';
import {buildCrown} from './crown.js';

// Initial geometry adapted from a model supplied by the author; maintained in this module.
export function buildOrgan(){
let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647, (seed - 1) / 2147483646);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const Y = V(0, 1, 0);

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

/* textures */
const latticeTex = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#1a1511'; g.fillRect(0, 0, w, h);
  const cell = 128;
  const draw = () => {
    for (let cy = 0; cy < 2; cy++) for (let cx = 0; cx < 2; cx++) {
      const x = cx * cell + cell / 2, y = cy * cell + cell / 2;
      g.strokeRect(cx * cell, cy * cell, cell, cell);
      g.beginPath(); g.arc(x, y, 44, 0, Math.PI * 2); g.stroke();
      for (let k = 0; k < 4; k++) {
        const an = k * Math.PI / 2 + Math.PI / 4;
        g.save(); g.translate(x + Math.cos(an) * 21, y + Math.sin(an) * 21); g.rotate(an);
        g.beginPath(); g.ellipse(0, 0, 17, 8, 0, 0, Math.PI * 2); g.stroke(); g.restore();
      }
      g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.stroke();
      g.beginPath();
      for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { g.moveTo(x + dx * 31, y + dy * 31); g.lineTo(x + dx * 64, y + dy * 64); }
      for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) { g.moveTo(x + dx * 44, y + dy * 44); g.lineTo(x + dx * 64, y + dy * 64); }
      g.stroke();
    }
  };
  g.lineCap = 'round';
  g.strokeStyle = '#efe7d4'; g.lineWidth = 9; draw();
  g.strokeStyle = 'rgba(185,145,70,.55)'; g.lineWidth = 1.5; draw();
});

function carving(g, w, h, bg) {
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } else g.clearRect(0, 0, w, h);
  const grad = g.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#f6dc8f'); grad.addColorStop(.45, '#b9893a'); grad.addColorStop(1, '#ecc870');
  g.strokeStyle = grad; g.fillStyle = grad; g.lineCap = 'round';
  const s = 64;
  for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) {
    const cx = x + s / 2, cy = y + s / 2;
    g.lineWidth = 6;
    for (const m of [1, -1]) {
      g.beginPath();
      for (let i = 0; i <= 44; i++) {
        const a = i / 44 * Math.PI * 3.1, r = 4 + i * .55;
        const px = cx + m * r * Math.cos(a), py = cy + r * Math.sin(a) * .92;
        i ? g.lineTo(px, py) : g.moveTo(px, py);
      }
      g.stroke();
    }
    for (let k = 0; k < 4; k++) {
      g.save(); g.translate(cx + (k % 2 ? -1 : 1) * s * .36, cy + (k < 2 ? -1 : 1) * s * .36);
      g.rotate(k * Math.PI / 2 + .6); g.beginPath(); g.ellipse(0, 0, 11, 5, 0, 0, Math.PI * 2); g.fill(); g.restore();
    }
    g.beginPath(); g.arc(cx, cy, 6, 0, Math.PI * 2); g.fill();
  }
}
const carvDarkTex = canvasTex(256, 256, (g, w, h) => carving(g, w, h, '#2b2016'));
const carvAlphaTex = canvasTex(256, 256, (g, w, h) => carving(g, w, h, null));
const carvAlphaArc = carvAlphaTex.clone(); carvAlphaArc.repeat.set(9, 3); carvAlphaArc.needsUpdate = true;
const carvAlphaFlat = carvAlphaTex.clone(); carvAlphaFlat.repeat.set(4, 4); carvAlphaFlat.needsUpdate = true;

const stoneTex = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = '#8b8172'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 9000; i++) { const v = 100 + rnd() * 80 | 0; g.fillStyle = `rgba(${v},${v - 8},${v - 20},.35)`; g.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 3, 2 + rnd() * 3); }
  g.strokeStyle = 'rgba(40,34,28,.55)'; g.lineWidth = 3;
  for (let r = 0; r < 8; r++) {
    const y = r * 64; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
    for (let x = (r % 2) * 64; x < w; x += 128) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 64); g.stroke(); }
  }
});
const woodTex = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = '#5a351c'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 160; i++) { g.strokeStyle = `rgba(${30 + rnd() * 40 | 0},${15 + rnd() * 20 | 0},8,.35)`; g.lineWidth = 1 + rnd() * 2; const y = rnd() * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * .3, y + rnd() * 8 - 4, w * .7, y + rnd() * 8 - 4, w, y); g.stroke(); }
});

/* materials */
const std = (o) => new THREE.MeshStandardMaterial(o);
const M = {
  white: std({ color: 0xede5d3, roughness: .55 }),
  gold: std({ color: 0xd6aa4c, roughness: .3, metalness: 1 }),
  tin: std({ color: 0xb6babd, roughness: .26, metalness: .95 }),
  tinDS: std({ color: 0xb0b4b7, roughness: .3, metalness: .95, side: THREE.DoubleSide }),
  dark: std({ color: 0x15110d, roughness: .95 }),
  wood: std({ map: woodTex, roughness: .6 }),
  woodDark: std({ map: woodTex, color: 0x7a6a5a, roughness: .75 }),
  knob: std({ color: 0x3a2214, roughness: .35 }),
  label: std({ color: 0xf6f3ec, roughness: .8 }),
  ivory: std({ color: 0xeee3c9, roughness: .35 }),
  ebony: std({ color: 0x14100d, roughness: .35 }),
  paper: std({ color: 0xf3eee2, roughness: .9, side: THREE.DoubleSide }),
  cloth: std({ color: 0x1d1f25, roughness: .92 }),
  trousers: std({ color: 0x23252c, roughness: .9 }),
  shoe: std({ color: 0x0d0b0a, roughness: .4 }),
  skin: std({ color: 0xd8a585, roughness: .6 }),
  hair: std({ color: 0x1e1510, roughness: .85 }),
  lattice: std({ map: latticeTex, roughness: .7 }),
  carvDark: std({ map: carvDarkTex, roughness: .45, metalness: .45 }),
  carvArc: std({ map: carvAlphaArc, alphaTest: .5, metalness: .95, roughness: .35, side: THREE.DoubleSide }),
  carvFlat: std({ map: carvAlphaFlat, alphaTest: .5, metalness: .95, roughness: .35, side: THREE.DoubleSide }),
  stone: std({ map: stoneTex, roughness: .95 }),
  lamp: std({ color: 0xfff1d0, emissive: 0xffe2a8, emissiveIntensity: 2.2 }),
  glass: std({ color: 0x222833, emissive: 0x9fb6d6, emissiveIntensity: .55, roughness: .3 }),
};


function add(mesh, p, x = 0, y = 0, z = 0) {
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true; p.add(mesh); return mesh;
}
function boxB(p, x0, x1, y0, y1, z0, z1, mat) {
  const ax = Math.min(x0, x1), bx = Math.max(x0, x1), ay = Math.min(y0, y1), by = Math.max(y0, y1), az = Math.min(z0, z1), bz = Math.max(z0, z1);
  return add(new THREE.Mesh(new THREE.BoxGeometry(bx - ax, by - ay, bz - az), mat), p, (ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
}
const overlayMaterials=new WeakMap();
function plane(p, w, h, mat, x, y, z, tile) {
  const g = new THREE.PlaneGeometry(w, h);
  if (tile) { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / tile, uv.getY(i) * h / tile); }
  if(!overlayMaterials.has(mat))overlayMaterials.set(mat,surfaceOverlay(mat));
  const m = add(new THREE.Mesh(g, overlayMaterials.get(mat)), p, x, y, z); m.castShadow = false; return m;
}
function goldFrame(p, x0, x1, y0, y1, z, t = .03) {
  boxB(p, x0 - t, x1 + t, y1, y1 + t, z, z + .03, M.gold);
  boxB(p, x0 - t, x1 + t, y0 - t, y0, z, z + .03, M.gold);
  boxB(p, x0 - t, x0, y0, y1, z, z + .03, M.gold);
  boxB(p, x1, x1 + t, y0, y1, z, z + .03, M.gold);
}
function limb(p, a, b, r, mat) {
  const dir = new THREE.Vector3().subVectors(b, a), len = dir.length();
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(len - r, .01), 6, 14), mat);
  m.position.copy(a).addScaledVector(dir, .5);
  m.quaternion.setFromUnitVectors(Y, dir.normalize());
  m.castShadow = true; m.receiveShadow = true; p.add(m); return m;
}
function sphere(p, r, mat, x, y, z, sx = 1, sy = 1, sz = 1) {
  const m = add(new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), mat), p, x, y, z); m.scale.set(sx, sy, sz); return m;
}
function rosette(p, x, y, z, r = .06) {
  const g = new THREE.Group(); g.position.set(x, y, z); p.add(g);
  const d = new THREE.Mesh(new THREE.CylinderGeometry(r * .45, r * .5, r * .5, 16), M.gold); d.rotation.x = Math.PI / 2; g.add(d);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const s = new THREE.Mesh(new THREE.SphereGeometry(r * .32, 10, 8), M.gold); s.position.set(Math.cos(a) * r * .7, Math.sin(a) * r * .7, 0); s.scale.set(1.3, .7, .6); s.rotation.z = a; g.add(s); }
}
/* vertical flue pipe with gold mouth */
function pipe(p, x, z, r, yFoot, yMouth, yTop) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, yTop - yMouth, 26), M.tin); body.position.y = (yTop + yMouth) / 2;
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(r, r * .14, yMouth - yFoot, 26), M.tin); foot.position.y = (yMouth + yFoot) / 2;
  const lip = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.01, r * 1.01, r * 2.6, 26, 1, true, -.8, 1.6), M.gold); lip.position.y = yMouth + r * 1.3;
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(r * 1.05, r * .45, .004), M.dark); mouth.position.set(0, yMouth + r * .22, r * .985);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, .005, 6, 26), M.tin); ring.rotation.x = Math.PI / 2; ring.position.y = yTop;
  for (const m of [body, foot, lip]) { m.castShadow = true; m.receiveShadow = true; g.add(m); }
  g.add(mouth, ring);
  g.position.set(x, 0, z); p.add(g); return g;
}
/* horizontal reed (trompeta de batalha) */
function reed(p, origin, dir, len, rb, rs) {
  dir = dir.clone().normalize();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rb, rs, len, 16, 1, true), M.tinDS);
  m.position.copy(origin).addScaledVector(dir, len / 2);
  m.quaternion.setFromUnitVectors(Y, dir); m.castShadow = true; p.add(m);
  const boot = new THREE.Mesh(new THREE.CylinderGeometry(rs * 1.8, rs * 1.8, .05, 12), M.tin);
  boot.position.copy(origin); boot.quaternion.copy(m.quaternion); p.add(boot);
}
function garland(p, curve, n, tubeR = .025, beadR = .042) {
  const t = add(new THREE.Mesh(new THREE.TubeGeometry(curve, 60, tubeR, 8), M.gold), p);
  for (let i = 0; i <= n; i++) {
    const q = curve.getPoint(i / n);
    const b = sphere(p, beadR * (.75 + rnd() * .5), M.gold, q.x, q.y, q.z, 1.3, .8, .8);
    b.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
  }
  return t;
}
function cherub(p, x, y, z) {
  const g = new THREE.Group(); g.position.set(x, y, z); p.add(g);
  const W = M.white;
  sphere(g, .1, W, 0, .14, 0, 1, 1.25, .9);
  sphere(g, .08, W, 0, .34, .01);
  sphere(g, .084, W, 0, .37, -.01, 1, .7, 1);            // curls
  limb(g, V(-.05, .06, .02), V(-.08, .05, .17), .045, W);  // thighs
  limb(g, V(.05, .06, .02), V(.1, .04, .16), .045, W);
  limb(g, V(-.08, .05, .17), V(-.07, -.1, .2), .035, W);   // shins
  limb(g, V(.1, .04, .16), V(.12, -.1, .18), .035, W);
  limb(g, V(-.09, .22, 0), V(-.14, .12, .1), .03, W);      // arms
  limb(g, V(.09, .22, 0), V(.16, .3, .08), .03, W);
  for (const s of [-1, 1]) { const w = sphere(g, .1, W, s * .09, .24, -.09, .45, 1, .25); w.rotation.z = s * .5; }
  const sash = new THREE.Mesh(new THREE.TorusGeometry(.105, .012, 6, 20, Math.PI * 1.2), M.gold); sash.position.set(0, .15, 0); sash.rotation.set(.3, 0, .9); g.add(sash);
  return g;
}

/* ---------- ORGAN ---------- */
const organ = new THREE.Group(); organ.name = "claude-refined-organ";
const ZB = -1.8;

/* lower case, centre with the console window */
boxB(organ, -1.0, -.6, 0, 1.8, ZB, 0, M.white);
boxB(organ, .6, 1.0, 0, 1.8, ZB, 0, M.white);
boxB(organ, -1.0, 1.0, 1.8, 2.55, ZB, 0, M.white);
boxB(organ, -2.6, 2.6, 0, 2.75, ZB, -1.0, M.white);   // inner body behind the curved front
boxB(organ, -.6, .6, 0, .62, ZB, 0, M.white);
boxB(organ, -.6, .6, .62, 1.8, ZB, -.55, M.white);          // back of the recess
/* double moulded frame around the console window */
goldFrame(organ, -.6, .6, .62, 1.8, 0, .04);
boxB(organ, -.7, .7, 1.84, 1.9, 0, .035, M.white); boxB(organ, -.7, -.64, .62, 1.84, 0, .035, M.white); boxB(organ, .64, .7, .62, 1.84, 0, .035, M.white);
goldFrame(organ, -.7, .7, .62, 1.9, 0, .014);
goldFrame(organ, -.5, .5, 1.5, 1.72, -.55, .012);            // framed panel at the back of the recess
plane(organ, 1.0, .22, std({ color: 0xf2ead8, roughness: .6 }), 0, 1.61, -.548);

/* Existing interactive manuals replace the source's static keyboard. */
boxB(organ, -.56, .56, .62, .70, -.55, .19, M.wood);
boxB(organ, -.56, -.535, .70, .86, -.55, .19, M.wood);
boxB(organ, .535, .56, .70, .86, -.55, .19, M.wood);
const {group: consoleGroup, keys} = buildInteractiveKeyboards();
consoleGroup.position.set(0, .72, -.26);
consoleGroup.scale.set(.63, .65, .65);
organ.add(consoleGroup);
/* pedals (pisas) */
boxB(organ, -.5, .5, 0, .07, 0, .42, M.wood);
for (let i = 0; i < 9; i++) boxB(organ, -.36 + i * .09 - .025, -.36 + i * .09 + .025, .07, .1, .1, .32, M.woodDark);

/* music desk, sheets, lamp */
{
  const desk = new THREE.Group(); desk.position.set(0, 1.18, -.42); desk.rotation.x = -.2; organ.add(desk);
  boxB(desk, -.4, .4, -.26, .26, -.015, .015, M.white);
  boxB(desk, -.4, .4, -.29, -.26, -.015, .07, M.gold);
  const s1 = boxB(desk, -.3, -.01, -.24, .2, .016, .02, M.paper); s1.rotation.z = .02;
  const s2 = boxB(desk, .01, .3, -.24, .2, .016, .02, M.paper); s2.rotation.z = -.02;
  boxB(desk, -.33, -.31, -.25, .19, .016, .03, std({ color: 0x2f6b4a, roughness: .7 }));
  boxB(desk, .31, .33, -.25, .17, .016, .03, std({ color: 0xb2452e, roughness: .7 }));
}
boxB(organ, -.45, .45, 1.765, 1.785, -.25, -.19, M.lamp);
const deskLight = new THREE.PointLight(0xffd8a0, 1.6, 2.6, 2);
deskLight.position.set(0, 1.62, -.1); organ.add(deskLight);

/* draw-stop knobs on both jambs */
function knob(x, y, labelSide) {
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, .06, 12), M.knob);
  shaft.rotation.x = Math.PI / 2; add(shaft, organ, x, y, .03);
  const head = new THREE.Mesh(new THREE.CylinderGeometry(.03, .027, .035, 20), M.knob);
  head.rotation.x = Math.PI / 2; add(head, organ, x, y, .075);
  const cap = sphere(organ, .03, M.knob, x, y, .092, 1, 1, .35);
  if (labelSide) boxB(organ, x + labelSide * .042 - .022, x + labelSide * .042 + .022, y - .011, y + .011, 0, .004, M.label);
}
/* recessed cream jamb panels holding the stop knobs */
for (const sx of [-1, 1]) {
  plane(organ, .29, .98, std({ color: 0xf1e8d2, roughness: .6 }), sx * .81, 1.28, .002);
  goldFrame(organ, sx > 0 ? .665 : -.955, sx > 0 ? .955 : -.665, .79, 1.77, 0, .014);
}
/* stop knobs: three columns stepping up outwards (6 · 7 · 8, shortest next to the keyboard), bottom-aligned, mirrored on the right */
for (const sx of [-1, 1]) {
  [[.725, 6], [.81, 7], [.895, 8]].forEach(([x, n]) => { for (let i = 0; i < n; i++) knob(sx * x, .9 + i * .11, 0); });
}
/* lower decoration: bays (carved panel over pierced rosette fretwork) between pilasters */
function whiteFrame(p, x0, x1, y0, y1, t = .045, d = .045) {
  boxB(p, x0 - t, x1 + t, y1, y1 + t, 0, d, M.white); boxB(p, x0 - t, x1 + t, y0 - t, y0, 0, d, M.white);
  boxB(p, x0 - t, x0, y0, y1, 0, d, M.white); boxB(p, x1, x1 + t, y0, y1, 0, d, M.white);
  // One ivory frame; omit the nested hairline gilt frame and its coincident edge faces.
}
function bay(p, x0, x1) {
  const m = (x0 + x1) / 2, w = x1 - x0 - .1;
  plane(p, w, 1.06, M.lattice, m, .95, .004, .42); whiteFrame(p, x0 + .05, x1 - .05, .42, 1.48);
  plane(p, w, .36, M.carvDark, m, 1.8, .004, .4); whiteFrame(p, x0 + .05, x1 - .05, 1.62, 1.98);
  goldFrame(p, x0 + .07, x1 - .07, .1, .3, 0, .015);
  /* laurel festoon hanging between the corbels */
  garland(p, new THREE.QuadraticBezierCurve3(V(x0 + .07, 2.45, .075), V(m, 2.1, .09), V(x1 - .07, 2.45, .075)), 12, .018, .04);
  for (const xe of [x0 + .07, x1 - .07]) for (let k = 1; k <= 3; k++) sphere(p, .026 - k * .004, M.gold, xe, 2.43 - k * .055, .08);
}
const corbelGeo = new THREE.CylinderGeometry(.075, .035, .3, 4, 1); corbelGeo.rotateY(Math.PI / 4);
function pil(p, x) {
  boxB(p, x - .075, x + .075, 0, 2.06, 0, .075, M.white);
  boxB(p, x - .09, x + .09, 0, .3, 0, .095, M.white);
  boxB(p, x - .09, x + .09, .3, .32, 0, .1, M.gold);
  goldFrame(p, x - .028, x + .028, .45, 1.9, .075, .012);
  boxB(p, x - .1, x + .1, 2.04, 2.12, 0, .115, M.gold);
  const c = add(new THREE.Mesh(corbelGeo, M.gold), p, x, 2.27, .06); c.scale.z = .75;
  for (const dx of [-.04, 0, .04]) sphere(p, .014, M.gold, x + dx, 2.11, .125);
  sphere(p, .035, M.gold, x, 2.44, .1, 1, 1.2, .5);
}
goldFrame(organ, -.5, .5, .14, .52, 0, .02);
/* row of six gold medallions in two framed panels */
for (const sx of [-1, 1]) {
  goldFrame(organ, sx > 0 ? .06 : -.92, sx > 0 ? .92 : -.06, 1.95, 2.1, 0, .014);
  for (const x of [.2, .49, .78]) { rosette(organ, sx * x, 2.025, .02, .05); const r = new THREE.Mesh(new THREE.TorusGeometry(.055, .008, 6, 20), M.gold); add(r, organ, sx * x, 2.025, .015); }
}
/* gold bead-and-dentil band */
boxB(organ, -1.0, 1.0, 2.135, 2.165, 0, .045, M.gold);
for (let i = 0; i < 41; i++) { const x = -.96 + i * .048; boxB(organ, x - .011, x + .011, 2.105, 2.135, 0, .035, M.gold); }
for (let i = 0; i < 50; i++) sphere(organ, .011, M.gold, -.98 + i * .04, 2.185, .03);
/* frieze: gold acanthus bracket under the pipe-shelf, flanked by large rosettes */
{
  const prof = [[0, 0], [.04, .02], [.07, .08], [.12, .16], [.2, .24], [.28, .3], [.3, .33], [0, .33]].map(([x, y]) => new THREE.Vector2(x, y));
  const bk = new THREE.Mesh(new THREE.LatheGeometry(prof, 24, -Math.PI / 2, Math.PI), M.gold);
  bk.scale.set(1, 1, .55); add(bk, organ, 0, 2.21, .0);
  for (let k = 0; k < 9; k++) {
    const a = (-1 + 2 * k / 8) * 1.3;
    const lf = sphere(organ, .09, M.gold, Math.sin(a) * .2, 2.4 + Math.cos(a) * .05, Math.cos(a) * .11 + .02, .45, 1.1, .3);
    lf.rotation.z = -a * .7;
  }
  sphere(organ, .035, M.gold, 0, 2.2, .04);
  for (const sx of [-1, 1]) {
    rosette(organ, sx * .55, 2.37, .03, .12);
    const r1 = new THREE.Mesh(new THREE.TorusGeometry(.13, .012, 6, 28), M.gold); add(r1, organ, sx * .55, 2.37, .03);
    for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; sphere(organ, .022, M.gold, sx * .55 + Math.cos(a) * .15, 2.37 + Math.sin(a) * .15, .03, 1.4, .7, .6).rotation.z = a; }
  }
}
/* lateral lower case: two flat bays and a chamfered corner bay at 45° */
function buildLowerSide(s) {
  /* the front recedes from the console in a concave (inward) curve */
  const f = new THREE.Group(); f.position.set(s * 1.0, 0, 0); if (s < 0) f.scale.x = -1; organ.add(f);
  const segs = [[.5, .6], [.72, .42], [.62, .25], [.58, .1]];   // steep beside the console, flattening outwards (concave)
  let px = 0, pz = 0;
  segs.forEach(([w, th], i) => {
    const a = new THREE.Group(); a.position.set(px, 0, pz); a.rotation.y = th; f.add(a);
    boxB(a, 0, w, 0, 2.55, -1.3, 0, M.white);
    pil(a, 0); bay(a, .08, w - .08);
    if (i === segs.length - 1) pil(a, w);
    boxB(a, -.07, w + .07, 2.55, 2.75, -1.3, .13, M.white);
    boxB(a, -.07, w + .09, 2.5, 2.555, -1.3, .145, M.gold);
    boxB(a, -.07, w + .07, 2.745, 2.76, -1.3, .135, M.gold);
    px += w * Math.cos(th); pz -= w * Math.sin(th);
  });
  boxB(f, 1.6, px, 0, 2.76, ZB, pz, M.white);
}
buildLowerSide(1); buildLowerSide(-1);
/* impost cornice */
boxB(organ, -1.05, 1.05, 2.55, 2.75, ZB, .13, M.white);
boxB(organ, -1.07, 1.07, 2.5, 2.555, ZB, .145, M.gold);
boxB(organ, -1.05, 1.05, 2.745, 2.76, ZB, .135, M.gold);
boxB(organ, -2.4, 2.4, 2.75, 5.4, ZB, -1.0, M.white);   // upper inner body

/* ---- upper centre: convex tower ---- */
const R = 1.25, A = .87, zc = .05 - R * Math.cos(A);
boxB(organ, -1.57, 1.57, 2.75, 7.2, ZB, -.9, M.white);         // case body behind
boxB(organ, -1.1, 1.1, 2.75, 7.2, -.9, -.82, M.dark);
for (const s of [-1, 1]) boxB(organ, s * 1.03, s * 1.1, 2.75, 7.2, -.82, .05, M.dark);

const bowl = add(new THREE.Mesh(new THREE.CylinderGeometry(R + .14, R - .2, .32, 48, 1, false, -A * 1.02, 2 * A * 1.02), M.gold), organ, 0, 3.08, zc);
add(new THREE.Mesh(new THREE.CylinderGeometry(R + .19, R + .19, .05, 48, 1, false, -A * 1.02, 2 * A * 1.02), M.white), organ, 0, 3.265, zc);
{
  const N = 7;
  for (let i = 0; i < N; i++) {
    const t = -1 + 2 * i / (N - 1), th = t * A * .88;
    const r = .165 - .06 * Math.abs(t);
    pipe(organ, R * Math.sin(th), zc + R * Math.cos(th), r, 3.29, 3.95, 7.00 + .75 * Math.cos(t * Math.PI / 2));
  }
}
/* fan of horizontal trumpets below the tower */
for (let i = 0; i < 19; i++) {
  const ph = (-1 + 2 * i / 18) * 1.35;
  const d = V(Math.sin(ph), .02, Math.cos(ph));
  reed(organ, V(0, 2.86, -.15).addScaledVector(d, .6), d, .42 + .08 * Math.cos(ph), .038, .01);
}
/* pilasters with gold panels */
for (const s of [-1, 1]) {
  for (const xc of [1.12, 1.48]) {
    const d = xc > 1.3 ? -.2 : -.04;   // step back to follow the concave sides
    boxB(organ, s * xc - .09, s * xc + .09, 2.75, 7.2, -.45, .12 + d, M.white);
    boxB(organ, s * xc - .11, s * xc + .11, 2.75, 2.92, -.45, .14 + d, M.white);
    boxB(organ, s * xc - .115, s * xc + .115, 6.98, 7.08, -.45, .15 + d, M.gold);
    boxB(organ, s * xc - .015, s * xc + .015, 3.0, 6.9, .12 + d, .135 + d, M.gold);
  }
  boxB(organ, s * 1.21, s * 1.39, 2.75, 7.2, -.45, -.12, M.white);
  plane(organ, .18, 3.95, M.carvDark, s * 1.3, 4.95, -.118, .18);
}

/* Open arched cornice and shell crest reconstructed from the close-up. */
organ.add(buildCrown(M));

/* ---- side wings (built once in local coords, mirrored on the left) ---- */
const U = new THREE.CubicBezierCurve(new THREE.Vector2(0, 7.3), new THREE.Vector2(.05, 6.05), new THREE.Vector2(.6, 5.8), new THREE.Vector2(1.6, 5.72));
const uPts = U.getPoints(300);
const yU = (x) => { let best = uPts[0]; for (const p of uPts) if (Math.abs(p.x - x) < Math.abs(best.x - x)) best = p; return best.y; };
const BAND = .22;
const pipeTop = (x) => Math.min(6.15 - 1.45 * (x - .18) / 1.12, yU(x) - BAND - .22);

function buildSide(s) {
  const g = new THREE.Group(); g.position.set(s * 1.55, 0, -.3); g.rotation.y = s * .3; if (s < 0) g.scale.x = -1; organ.add(g);
  /* plinth + reeds */
  boxB(g, 0, 1.6, 2.75, 3.02, -.5, .08, M.white);
  boxB(g, 0, 1.6, 2.98, 3.02, -.5, .1, M.gold);
  for (let i = 0; i < 11; i++) reed(g, V(.12 + i * .125, 3.09, .03), V(0, .06, 1), .7 - i * .025, .042, .012);
  /* back (dark front face, white body) following the S-cornice */
  const back = new THREE.Shape();
  back.moveTo(0, 2.75); back.lineTo(1.6, 2.75);
  for (let i = uPts.length - 1; i >= 0; i--) if (uPts[i].x <= 1.6) back.lineTo(uPts[i].x, uPts[i].y - BAND);
  back.closePath();
  const bg = new THREE.ExtrudeGeometry(back, { depth: .7, bevelEnabled: false, curveSegments: 4 });
  add(new THREE.Mesh(bg, [M.dark, M.white]), g, 0, 0, -1.2);
  /* pipe flat */
  for (let i = 0; i < 10; i++) {
    const x = .18 + i * (1.12 / 9);
    pipe(g, x, -.12, .075 - .025 * i / 9, 3.02, 3.72, pipeTop(x));
  }
  /* gold pipe-shade between pipe tops and cornice */
  const sh = new THREE.Shape();
  const xs = []; for (let i = 0; i <= 30; i++) xs.push(.06 + i * (1.36 / 30));
  sh.moveTo(xs[0], yU(xs[0]) - BAND);
  for (const x of xs) sh.lineTo(x, yU(x) - BAND + .01);
  for (let i = xs.length - 1; i >= 0; i--) sh.lineTo(xs[i], pipeTop(xs[i]) - .14);
  sh.closePath();
  add(new THREE.Mesh(new THREE.ShapeGeometry(sh), M.carvFlat), g, 0, 0, .02);
  /* S-shaped cornice */
  const band = new THREE.Shape();
  band.moveTo(uPts[0].x, uPts[0].y);
  for (const p of uPts) band.lineTo(p.x, p.y);
  for (let i = uPts.length - 1; i >= 0; i--) band.lineTo(uPts[i].x, uPts[i].y - BAND);
  band.closePath();
  add(new THREE.Mesh(new THREE.ExtrudeGeometry(band, { depth: .34, bevelEnabled: true, bevelThickness: .015, bevelSize: .015, bevelSegments: 2, curveSegments: 4 }), M.white), g, 0, 0, -.16);
  const U3 = new THREE.CubicBezierCurve3(V(0, 7.3 - BAND / 2, .2), V(.05, 6.05 - BAND / 2, .2), V(.6, 5.8 - BAND / 2, .2), V(1.6, 5.72 - BAND / 2, .2));
  garland(g, U3, 26, .03, .05);
  const U4 = new THREE.CubicBezierCurve3(V(.02, 7.25, .2), V(.07, 6.02, .21), V(.62, 5.77, .21), V(1.58, 5.7, .2));
  add(new THREE.Mesh(new THREE.TubeGeometry(U4, 60, .018, 6), M.gold), g);
  const vol = new THREE.Mesh(new THREE.TorusGeometry(.1, .03, 8, 24), M.gold); add(vol, g, 1.55, 5.52, .19);
  /* outer post and cherub */
  boxB(g, 1.42, 1.62, 2.75, 5.5, -.45, .14, M.white);
  boxB(g, 1.4, 1.64, 5.38, 5.48, -.45, .16, M.gold);
  plane(g, .1, 2.35, M.carvDark, 1.52, 4.05, .142, .1);
  boxB(g, 1.6, 1.64, 2.75, 5.5, -1.2, -.45, M.white);
  cherub(g, 1.5, 5.74, .02);
}
buildSide(1); buildSide(-1);

boxB(organ, -.6, .6, .49, .55, .62, .95, M.wood);
for (const sx of [-.55, .55]) for (const sz of [.66, .91]) boxB(organ, sx - .025, sx + .025, 0, .49, sz - .025, sz + .025, M.wood);
boxB(organ, -.55, .55, .12, .16, .77, .8, M.wood);


/* ---------- GALLERY ---------- */
const room = new THREE.Group();
const gallery = buildGallery(M);

/* ---------- church context ---------- */
{
  const st = (w, h) => { const t = stoneTex.clone(); t.repeat.set(w / 2.2, h / 2.2); t.needsUpdate = true; return std({ map: t, roughness: .95 }); };
  const back = new THREE.Mesh(new THREE.PlaneGeometry(9, 15.8), st(9, 15.8)); add(back, room, 0, 3.3, -2.26);
  for (const s of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(14, 15.8), st(14, 15.8)); w.rotation.y = -s * Math.PI / 2; add(w, room, s * 4.5, 3.3, 4.74);
  }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(9, 14), st(9, 14)); floor.rotation.x = -Math.PI / 2; add(floor, room, 0, -4.6, 4.74);
  /* partition below the gallery with arched window */
  boxB(room, -4.45, 4.45, -4.6, -.7, 1.55, 1.7, M.woodDark);
  const arch = new THREE.Shape(); arch.moveTo(-.55, 0); arch.lineTo(.55, 0); arch.lineTo(.55, .9); arch.absarc(0, .9, .55, 0, Math.PI, false); arch.closePath();
  add(new THREE.Mesh(new THREE.ShapeGeometry(arch), M.glass), room, 0, -2.9, 1.71);
  /* lancet window on the left wall */
  const lan = new THREE.Shape(); lan.moveTo(-.5, 0); lan.lineTo(.5, 0); lan.lineTo(.5, 2.2);
  lan.quadraticCurveTo(.5, 3.1, 0, 3.5); lan.quadraticCurveTo(-.5, 3.1, -.5, 2.2); lan.closePath();
  const lw = add(new THREE.Mesh(new THREE.ShapeGeometry(lan), M.glass), room, -4.48, 4.3, 1.4); lw.rotation.y = Math.PI / 2;
  /* timber ceiling */
  const th = Math.atan2(1.6, 4.5), L = Math.hypot(4.5, 1.6);
  const ceilMat = std({ map: (() => { const t = woodTex.clone(); t.repeat.set(3, 6); t.needsUpdate = true; return t; })(), color: 0x9a8070, roughness: .8 });
  for (const s of [-1, 1]) {
    const grp = new THREE.Group(); grp.position.set(s * 2.25, 10.4, 4.74); grp.rotation.z = -s * th; room.add(grp);
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(L, 14), ceilMat); pl.rotation.x = Math.PI / 2; grp.add(pl);
    for (let i = 0; i < 24; i++) boxB(grp, -L / 2, L / 2, -.14, 0, -7 + i * .6, -7 + i * .6 + .1, M.woodDark);
    for (let i = 0; i < 5; i++) boxB(grp, -L / 2 + i * L / 4 - .05, -L / 2 + i * L / 4 + .05, -.2, 0, -7, 7, M.woodDark);
  }
  for (let i = 0; i < 5; i++) boxB(room, -4.5, 4.5, 9.45, 9.65, -1.6 + i * 2.6, -1.4 + i * 2.6, M.woodDark);
}


const windowLight = new THREE.PointLight(0xd8e4ff, 6, 12, 1.6);windowLight.position.set(-3.8,6,1.4);room.add(windowLight);
return {root: organ, keys, consoleGroup, materials: M, room, gallery};
}
