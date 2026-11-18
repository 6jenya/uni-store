// 3D-сцена на головній: будматеріали UNI. Клік по предмету відкриває відділ.
import * as THREE from './three.module.min.js';

const box = document.getElementById('scene3d');
const tip = document.getElementById('scene-tip');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, powerPreference: 'low-power'});
} catch (e) { box.classList.add('no3d'); throw e; }
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
box.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
camera.position.set(5.4, 4.0, 6.4);
camera.lookAt(0, 0.35, 0.1);

scene.add(new THREE.HemisphereLight(0xffffff, 0x2a2622, 1.25));
const key = new THREE.DirectionalLight(0xfff1e2, 2.4); key.position.set(5, 8, 4); scene.add(key);
const rim = new THREE.DirectionalLight(0xff8a3d, 1.6); rim.position.set(-6, 3, -5); scene.add(rim);

const M = (color, rough = 0.75, metal = 0) => new THREE.MeshStandardMaterial({color, roughness: rough, metalness: metal});
const world = new THREE.Group(); scene.add(world);
const pick = []; // предмети, на які можна натиснути
const tag = (obj, name, url) => { obj.traverse(o => { o.userData = {name, url}; }); pick.push(obj); return obj; };

// Майданчик і мʼяка тінь
const ground = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 0.12, 64), M(0x2b2d33, 0.95));
ground.position.y = -0.06; world.add(ground);
const ring = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.025, 8, 96), M(0xf26a1b, 0.4));
ring.rotation.x = Math.PI / 2; ring.position.y = 0.005; world.add(ring);
const shadowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const r = g.createRadialGradient(64, 64, 4, 64, 64, 64); r.addColorStop(0, 'rgba(0,0,0,.55)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
const blob = (w, d, x, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({map: shadowTex, transparent: true, depthWrite: false})); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.008, z); world.add(m); };

// Палет із цеглою
const pallet = new THREE.Group();
const wood = M(0xc8a06a, 0.85), woodD = M(0xa27b4a, 0.9);
for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.06, 0.2), wood); s.position.set(0, 0.2, -0.5 + i * 0.25); pallet.add(s); }
for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.14, 0.16), woodD); b.position.set(0, 0.09, -0.5 + i * 0.5); pallet.add(b); }
const brickG = new THREE.BoxGeometry(0.5, 0.15, 0.24);
const brickM = M(0xb8502c, 0.9);
const bricks = new THREE.InstancedMesh(brickG, brickM, 3 * 4 * 3);
const tmp = new THREE.Object3D(); let n = 0;
for (let y = 0; y < 3; y++) for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) {
  const rot = y % 2 === 1;
  tmp.position.set(rot ? -0.54 + i * 0.54 : -0.54 + i * 0.54, 0.31 + y * 0.16, -0.39 + j * 0.26);
  tmp.rotation.set(0, (Math.random() - .5) * 0.04, 0); tmp.updateMatrix();
  bricks.setMatrixAt(n++, tmp.matrix);
  bricks.setColorAt(n - 1, new THREE.Color().setHSL(0.04 + Math.random() * 0.015, 0.6, 0.38 + Math.random() * 0.06));
}
pallet.add(bricks);
pallet.position.set(-0.9, 0, 0.5); pallet.rotation.y = 0.35;
world.add(tag(pallet, 'Цегла та будматеріали', 'bulk.html')); blob(2.6, 2.2, -0.9, 0.5);

// Двотавр
const steel = M(0xb7c0ca, 0.42, 0.45);
const beam = new THREE.Group();
const fl1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.05, 0.36), steel); fl1.position.y = 0.025;
const fl2 = fl1.clone(); fl2.position.y = 0.415;
const web = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.34, 0.05), steel); web.position.y = 0.22;
beam.add(fl1, fl2, web);
beam.position.set(0.6, 0, -1.25); beam.rotation.y = -0.25;
world.add(tag(beam, 'Металопрокат', 'metal.html')); blob(3.6, 1, 0.6, -1.25);

// Дошки
const planks = new THREE.Group();
for (let i = 0; i < 6; i++) {
  const p = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.07, 0.24), M(new THREE.Color().setHSL(0.09, 0.45, 0.6 + (i % 3) * 0.04), 0.8));
  p.position.set((i % 2) * 0.06, 0.04 + Math.floor(i / 2) * 0.075, -0.27 + (i % 2) * 0.27); planks.add(p);
}
planks.position.set(1.45, 0, 1.05); planks.rotation.y = 1.25;
world.add(tag(planks, 'Пиломатеріали', 'pilomaterialy.html')); blob(1.4, 2.8, 1.45, 1.05);

// Мішок цементу
const bagGeo = new THREE.BoxGeometry(0.62, 0.22, 0.95, 6, 2, 8);
const pos = bagGeo.attributes.position;
for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i); pos.setY(i, pos.getY(i) * (1 - 0.55 * Math.pow(Math.abs(x) / 0.31, 4)) * (1 - 0.35 * Math.pow(Math.abs(z) / 0.475, 6))); }
bagGeo.computeVertexNormals();
const bag = new THREE.Group();
const bag1 = new THREE.Mesh(bagGeo, M(0xd9d6cf, 0.95)); bag1.position.y = 0.11;
const band = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.226, 0.14), M(0xf26a1b, 0.8)); band.position.y = 0.11;
const bag2 = bag1.clone(); bag2.position.set(0.05, 0.31, 0.03); bag2.rotation.y = 0.12;
const band2 = band.clone(); band2.position.set(0.05, 0.31, 0.03); band2.rotation.y = 0.12;
bag.add(bag1, band, bag2, band2);
bag.position.set(-1.7, 0, -0.9); bag.rotation.y = 0.5;
world.add(tag(bag, 'Цемент і сипучі', 'bulk.html')); blob(1.3, 1.5, -1.7, -0.9);

// Відро фарби
const bucket = new THREE.Group();
const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.3, 0.62, 40), M(0xf26a1b, 0.55));
b1.position.y = 0.31;
const lbl = new THREE.Mesh(new THREE.CylinderGeometry(0.343, 0.322, 0.26, 40, 1, true), M(0xf4f4f2, 0.7)); lbl.position.y = 0.3;
const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.05, 40), M(0xd8580f, 0.5)); lid.position.y = 0.64;
const handle = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.012, 6, 40, Math.PI), M(0x777b82, 0.4, 0.8)); handle.position.y = 0.64; handle.rotation.y = 0.6;
bucket.add(b1, lbl, lid, handle);
bucket.position.set(0.15, 0, 1.75);
world.add(tag(bucket, 'Фарби й ремонт', 'repair.html')); blob(1, 1, 0.15, 1.75);

// Труби
const pipes = new THREE.Group();
const pipeM = M(0xe9edf1, 0.4, 0.1);
for (let i = 0; i < 3; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.2, 24, 1, true), pipeM); p.material.side = THREE.DoubleSide; p.rotation.z = Math.PI / 2; p.position.set(0, 0.09 + (i === 2 ? 0.16 : 0), i === 2 ? 0.1 : i * 0.2); pipes.add(p); }
pipes.position.set(1.85, 0, -0.15); pipes.rotation.y = 1.9;
world.add(tag(pipes, 'Сантехніка', 'santehnika.html')); blob(0.9, 2.4, 1.85, -0.15);

// Тротуарна плитка
const pav = new THREE.Group();
const pavM = [M(0x8d8f93, 0.95), M(0x9c5b45, 0.95)];
for (let y = 0; y < 4; y++) for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
  const t = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.1), pavM[(i + j + y) % 2]);
  t.position.set(-0.22 + i * 0.22, 0.03 + y * 0.062, -0.06 + j * 0.12); pav.add(t);
}
pav.scale.setScalar(1.6);
pav.position.set(-0.55, 0, 2.05); pav.rotation.y = -0.4;
world.add(tag(pav, 'Тротуарна плитка', 'plitka.html')); blob(1.3, 1, -0.55, 2.05);

// Розмір, анімація, взаємодія
function resize() {
  const w = box.clientWidth, h = box.clientHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h;
  camera.fov = w < 520 ? 40 : 34; camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(box); resize();

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2(-9, -9);
let visible = true, hover = null, tx = 0, ty = 0, rx = 0, ry = 0, last = performance.now();
new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) requestAnimationFrame(loop); }).observe(box);

box.addEventListener('pointermove', e => {
  const r = box.getBoundingClientRect();
  mouse.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  if (e.pointerType === 'mouse') { tx = mouse.x * 0.25; ty = mouse.y * 0.08; }
});
box.addEventListener('pointerleave', () => { mouse.set(-9, -9); tx = ty = 0; });
box.addEventListener('click', e => {
  const r = box.getBoundingClientRect();
  mouse.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  ray.setFromCamera(mouse, camera);
  const hit = ray.intersectObjects(pick, true)[0];
  if (hit && hit.object.userData.url) location.href = hit.object.userData.url;
});

function loop(t) {
  if (!visible) return;
  const dt = Math.min(50, t - last); last = t;
  if (!reduce) world.rotation.y += dt * 0.00012;
  rx += (ty - rx) * 0.05; ry += (tx - ry) * 0.05;
  scene.rotation.set(rx, ry, 0);
  ray.setFromCamera(mouse, camera);
  const hit = ray.intersectObjects(pick, true)[0];
  const h = hit ? pick.find(p => { let o = hit.object; while (o) { if (o === p) return true; o = o.parent; } return false; }) : null;
  if (h !== hover) {
    if (hover) hover.position.y = 0;
    hover = h; box.style.cursor = h ? 'pointer' : '';
    tip.textContent = h ? `${h.userData.name || h.children[0].userData.name} — відкрити відділ` : 'Натисни на товар, щоб відкрити відділ';
  }
  if (hover) hover.position.y += ((0.12) - hover.position.y) * 0.2;
  renderer.render(scene, camera);
  if (!reduce) requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
box.classList.add('ready');
