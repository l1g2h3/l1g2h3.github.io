/* =========================================================
   模块城市 — Three.js 场景
   六栋建筑 = 六个模块；昼夜循环、天空渐变、夜间亮窗与路灯。
   点击建筑进入对应页面。
   ========================================================= */
import * as THREE from 'three';
import { OrbitControls } from './assets/vendor/OrbitControls.js';
import { createRoom } from './room.js?v=20261110c';

/* ---------------- 模块定义 ---------------- */
const MODULES = [
  {
    id: 'english', title: '英语模块', tag: 'LIVE',
    desc: '按领域分组的短文阅读，点词看释义、搭配与易混辨析；划词收进生词本，复习页做翻牌自测，支持多设备同步。',
    href: 'vocab/', status: 'live'
  },
  {
    id: 'modeling', title: '数学建模竞赛', tag: '论文',
    desc: '2025 到 2026 的国赛、美赛与校赛论文，六篇完整归档。',
    href: 'work/?m=modeling', status: 'live'
  },
  {
    id: 'neuro', title: '类脑强化学习', tag: '软著',
    desc: 'PPO 与自注意力机制结合的 Pong 智能体，附软件著作权登记证书与说明书。',
    href: 'work/?m=rl', status: 'live'
  },
  {
    id: 'ct', title: 'CT 协议 DSA 路径规划', tag: '系统',
    desc: '低剂量介入下的 CT-DSA 虚实联动路径仿真与智能寻角控制。',
    href: 'work/?m=dsa', status: 'live'
  },
  {
    id: 'surgery', title: '手术机器人', tag: '模块',
    desc: '机构与控制模块：运动学建模、主从控制、精度验证实验的记录与拆解。',
    href: 'work/?m=surgery', status: 'soon'
  },
  {
    id: 'car', title: '智能车', tag: '作品',
    desc: '摄像头循迹的履带小车：二值化找线、中线提取、PID 打角。',
    href: 'work/?m=car', status: 'live'
  },
  {
    id: 'lab', title: '一些有趣的实验', tag: '动手',
    desc: '3D 打印、激光雕刻、光固化。做出来之后通常会发现：能，但要花三倍时间。',
    href: 'work/?m=lab', status: 'live'
  },
  {
    id: 'course', title: '课程相关', tag: '课程',
    desc: '课程作业、实验报告和笔记，整理中。',
    href: 'work/?m=course', status: 'soon'
  },
  {
    id: 'notes', title: '读书笔记', tag: 'SOON',
    desc: '在读的书、划下来的句子、读完之后的几句话。还没开始，先把灯留着。',
    href: '', status: 'soon'
  }
];

/* 行人：名字 + 一句身份，点一下会出卡片 */
const PEDS = [
  { name: '杨瑞瑜', note: '同队 · 影像仿真', color: '#8f6f52' },
  { name: '伏泓宇', note: '同队 · 路径规划', color: '#6f7f95' },
  { name: '陈鑫', note: '同队 · 实验验证', color: '#8a6f86' },
  { name: '张泽昊', note: '同队 · 强化学习', color: '#6f8a72' },
  { name: '马宇彤', note: '同队 · 软著', color: '#9a7b52' },
  { name: '王永波', note: '指导老师', color: '#5f6b78' },
  { name: '谢琳', note: '指导老师', color: '#7a6b60' },
  { name: '小周', note: '路过的同学', color: '#8b8375' },
  { name: '阿岚', note: '路过的同学', color: '#78838b' },
  { name: '老陈', note: '门卫', color: '#6b6459' }
];

const NS = MODULES.length;
const RADIUS = 27;
const START_HOUR = 16.2;

/* ---------------- 小工具 ---------------- */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------- 渲染器 ---------------- */
const host = document.getElementById('scene');

/* 出错时别停在“正在建城”，把原因显示出来 */
window.addEventListener('error', (ev) => {
  const el = document.getElementById('loading');
  if (!el || el.classList.contains('done')) return;
  el.classList.remove('done');
  const span = el.querySelector('span');
  if (span) span.textContent = '加载失败：' + (ev.message || '未知错误');
});

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  renderer = null;
}

if (!renderer) {
  document.getElementById('loading').classList.add('done');
  showFallback('WebGL 不可用');
} else {
  boot();
}

function showFallback(reason) {
  const sec = document.getElementById('fallback');
  sec.hidden = false;
  const ul = document.getElementById('fallbackList');
  ul.innerHTML = MODULES.map((m) => {
    const right = m.href ? '<span>' + m.tag + '</span>' : '<span>待建</span>';
    return '<li>' + (m.href
      ? '<a href="' + m.href + '">' + m.title + right + '</a>'
      : '<a>' + m.title + right + '</a>') + '</li>';
  }).join('');
  if (reason) console.warn('降级到列表模式：' + reason);
}

function boot() {
  const isSmall = window.innerWidth < 760;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall ? 1.4 : 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  /* 全场共享的收集器：立面材质、自发光件、路灯材质与灯（动画时统一调亮度） */
  const facades = [];
  const emissiveParts = [];
  const lampMats = [];
  const lampLights = [];
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 600);
  camera.position.set(32, 30, 80);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 8, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.minDistance = 20;
  controls.maxDistance = 150;
  controls.maxPolarAngle = Math.PI * 0.487;
  controls.enablePan = false;
  controls.zoomSpeed = 0.8;
  controls.rotateSpeed = 0.55;
  controls.update();

  /* ---------- 天空 ---------- */
  const skyUniforms = {
    topColor: { value: new THREE.Color('#1b2438') },
    bottomColor: { value: new THREE.Color('#e3a06a') },
    sunDir: { value: new THREE.Vector3(0, 0.3, 1) },
    sunColor: { value: new THREE.Color('#ffd9a8') },
    glow: { value: 0.5 }
  };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(320, 40, 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, uniforms: skyUniforms,
      vertexShader: `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 topColor; uniform vec3 bottomColor; uniform vec3 sunColor;
        uniform vec3 sunDir; uniform float glow;
        varying vec3 vDir;
        void main() {
          float h = clamp(vDir.y, -1.0, 1.0);
          vec3 col = mix(bottomColor, topColor, smoothstep(-0.01, 0.34, h));
          float d = max(dot(normalize(vDir), normalize(sunDir)), 0.0);
          col += sunColor * (pow(d, 90.0) * 1.4 + pow(d, 8.0) * 0.16) * glow;
          gl_FragColor = vec4(col, 1.0);
        }`
    })
  );
  sky.frustumCulled = false;
  scene.add(sky);

  /* ---------- 星空 ---------- */
  const starGeo = new THREE.BufferGeometry();
  const starPos = [];
  const rnd = mulberry32(7);
  for (let i = 0; i < 700; i++) {
    const u = rnd() * Math.PI * 2;
    const v = rnd() * 0.85 + 0.05;
    const r = 290;
    starPos.push(Math.cos(u) * Math.cos(v) * r, Math.sin(v) * r, Math.sin(u) * Math.cos(v) * r);
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xdfe8ff, size: 1.5, sizeAttenuation: false,
    transparent: true, opacity: 0, depthWrite: false
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  /* ---------- 光 ---------- */
  const hemi = new THREE.HemisphereLight(0xbcd6ee, 0x6b5c46, 0.6);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff3df, 2.2);
  sun.castShadow = true;
  const shadowSize = window.innerWidth < 760 ? 1024 : 2048;
  sun.shadow.mapSize.set(shadowSize, shadowSize);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 220;
  sun.shadow.camera.left = -62;
  sun.shadow.camera.right = 62;
  sun.shadow.camera.top = 62;
  sun.shadow.camera.bottom = -62;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);
  scene.add(sun.target);

  const moon = new THREE.DirectionalLight(0x91a8d8, 0);
  moon.position.set(-40, 60, -30);
  scene.add(moon);

  const fog = new THREE.Fog(0x8e9db0, 150, 520);
  scene.fog = fog;

  const fill = new THREE.AmbientLight(0x93a6c6, 0.12);
  scene.add(fill);

  /* ---------- 地面 ---------- */
  const gcv = document.createElement('canvas');
  gcv.width = gcv.height = 512;
  const gx = gcv.getContext('2d');
  gx.fillStyle = '#a89a76'; gx.fillRect(0, 0, 512, 512);
  const gr = mulberry32(4242);
  for (let i = 0; i < 2600; i++) {
    const r = 2 + gr() * 22;
    const v = gr();
    gx.fillStyle = v > 0.55 ? 'rgba(120,110,80,' + (0.03 + gr() * 0.07) + ')' : 'rgba(196,184,152,' + (0.03 + gr() * 0.06) + ')';
    gx.beginPath(); gx.arc(gr() * 512, gr() * 512, r, 0, Math.PI * 2); gx.fill();
  }
  const gTex = new THREE.CanvasTexture(gcv);
  gTex.wrapS = gTex.wrapT = THREE.RepeatWrapping;
  gTex.repeat.set(14, 14);
  gTex.colorSpace = THREE.SRGBColorSpace;
  const groundMat = new THREE.MeshStandardMaterial({ map: gTex, color: 0xffffff, roughness: 1, metalness: 0 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const plazaMat = new THREE.MeshStandardMaterial({ color: 0xd8c8ab, roughness: 0.92 });
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(11, 64), plazaMat);
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = 0.02;
  plaza.receiveShadow = true;
  scene.add(plaza);

  const roadMat = new THREE.MeshStandardMaterial({ color: 0x55514a, roughness: 1 });
  const ring = new THREE.Mesh(new THREE.RingGeometry(17.5, 21.5, 96), roadMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.015;
  ring.receiveShadow = true;
  scene.add(ring);

  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 3;
    const lane = new THREE.Mesh(new THREE.PlaneGeometry(4, 16), roadMat);
    lane.rotation.x = -Math.PI / 2;
    lane.rotation.z = -a;
    lane.position.set(Math.cos(a) * 13.5, 0.016, Math.sin(a) * 13.5);
    lane.receiveShadow = true;
    scene.add(lane);
  }

  /* 中心喷泉 */
  const basinMat = new THREE.MeshStandardMaterial({ color: 0xb3a68c, roughness: 0.9 });
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.4, 0.75, 40), basinMat);
  basin.position.y = 0.38;
  basin.castShadow = true; basin.receiveShadow = true;
  scene.add(basin);

  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x4d7d90, roughness: 0.18, metalness: 0.55,
    transparent: true, opacity: 0.9
  });
  const water = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.12, 40), waterMat);
  water.position.y = 0.72;
  scene.add(water);

  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.5, 2.2, 16), basinMat);
  column.position.y = 1.7;
  column.castShadow = true;
  scene.add(column);

  const jetMat = new THREE.MeshStandardMaterial({
    color: 0x223038, emissive: new THREE.Color('#8fdfe8'), emissiveIntensity: 0.4, roughness: 0.3
  });
  const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 1.4, 10), jetMat);
  jet.position.y = 3.2;
  scene.add(jet);
  emissiveParts.push({ mat: jetMat, max: 2.4 });
  const jetLight = new THREE.PointLight(0x9fe6f0, 0, 14, 2);
  jetLight.position.set(0, 2.4, 0);
  scene.add(jetLight);
  lampLights.push(jetLight);

  /* 广场纹路 */
  const inlay = new THREE.Mesh(
    new THREE.RingGeometry(4.2, 4.7, 64),
    new THREE.MeshStandardMaterial({ color: 0xb0a184, roughness: 0.9 })
  );
  inlay.rotation.x = -Math.PI / 2;
  inlay.position.y = 0.03;
  scene.add(inlay);

  /* ---------- 立面贴图 ---------- */

  function facadeMaterial(opt) {
    const { base, glass, cols, rows, lit = 0.55, seed = 1, warm = '#ffcf94' } = opt;
    const S = 512;
    const map = document.createElement('canvas'); map.width = S; map.height = S;
    const em = document.createElement('canvas'); em.width = S; em.height = S;
    const g = map.getContext('2d');
    const e = em.getContext('2d');
    const rand = mulberry32(seed);

    g.fillStyle = base; g.fillRect(0, 0, S, S);
    e.fillStyle = '#000'; e.fillRect(0, 0, S, S);

    /* 楼板横带 */
    const band = S / rows;
    for (let r = 0; r <= rows; r++) {
      g.fillStyle = 'rgba(0,0,0,.10)';
      g.fillRect(0, r * band - 1.5, S, 3);
    }

    const padX = 12, padY = 8;
    const cw = (S - padX * 2) / cols;
    const ch = (S - padY * 2) / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = padX + c * cw + cw * 0.16;
        const y = padY + r * ch + ch * 0.2;
        const w = cw * 0.68;
        const h = ch * 0.55;
        g.fillStyle = glass;
        g.fillRect(x, y, w, h);
        g.fillStyle = 'rgba(255,255,255,.10)';
        g.fillRect(x, y, w, h * 0.28);
        if (rand() < lit) {
          const warmth = 0.75 + rand() * 0.25;
          e.fillStyle = 'rgba(255,' + Math.round(190 * warmth) + ',' + Math.round(120 * warmth) + ',1)';
          e.fillRect(x, y, w, h);
        }
      }
    }

    const mapTex = new THREE.CanvasTexture(map);
    mapTex.colorSpace = THREE.SRGBColorSpace;
    mapTex.anisotropy = 8;
    mapTex.generateMipmaps = true;
    const emTex = new THREE.CanvasTexture(em);
    emTex.colorSpace = THREE.SRGBColorSpace;

    const mat = new THREE.MeshStandardMaterial({
      map: mapTex, emissiveMap: emTex, emissive: new THREE.Color(warm),
      emissiveIntensity: 0, roughness: 0.85, metalness: 0.06
    });
    facades.push(mat);
    return mat;
  }

  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xb9ab92, roughness: 0.95 });
  const stoneDark = new THREE.MeshStandardMaterial({ color: 0x8d8271, roughness: 0.95 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x9aa3a8, roughness: 0.4, metalness: 0.7 });
  const glowMat = (color, intensity = 1) => new THREE.MeshStandardMaterial({
    color: 0x222222, emissive: new THREE.Color(color), emissiveIntensity: intensity, roughness: 0.5
  });


  function mesh(geo, mat, x, y, z, opts = {}) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = opts.cast !== false;
    m.receiveShadow = opts.receive !== false;
    return m;
  }

  /* ---------- 六栋建筑 ---------- */
  function buildEnglish() {
    const g = new THREE.Group();
    const mat = facadeMaterial({ base: '#d3bfa1', glass: '#41565f', cols: 5, rows: 7, lit: 0.62, seed: 11 });
    g.add(mesh(new THREE.BoxGeometry(10.5, 1.4, 10.5), stoneMat, 0, 0.7, 0));
    g.add(mesh(new THREE.BoxGeometry(8, 10, 8), mat, 0, 1.4 + 5, 0));
    g.add(mesh(new THREE.BoxGeometry(8.6, 0.5, 8.6), stoneDark, 0, 11.4, 0));

    /* 屋顶摊开的书 */
    const pageMat = new THREE.MeshStandardMaterial({ color: 0xf3ead8, roughness: 0.9 });
    const left = mesh(new THREE.BoxGeometry(4.4, 0.42, 6.4), pageMat, -2.1, 12.4, 0);
    left.rotation.z = 0.22;
    const right = mesh(new THREE.BoxGeometry(4.4, 0.42, 6.4), pageMat, 2.1, 12.4, 0);
    right.rotation.z = -0.22;
    g.add(left, right);
    g.add(mesh(new THREE.BoxGeometry(0.5, 0.7, 6.4), stoneDark, 0, 11.9, 0));

    /* 门口灯带 */
    const strip = mesh(new THREE.BoxGeometry(6, 0.16, 0.16), glowMat('#ffcf8a', 1.2), 0, 1.7, 4.05, { cast: false });
    emissiveParts.push({ mat: strip.material, max: 1.6 });
    g.add(strip);
    return g;
  }

  function buildModeling() {
    const g = new THREE.Group();
    const mat = facadeMaterial({ base: '#cdb794', glass: '#3f5563', cols: 6, rows: 4, lit: 0.5, seed: 22 });
    g.add(mesh(new THREE.BoxGeometry(11, 1.2, 11), stoneMat, 0, 0.6, 0));
    let y = 1.2;
    [8.6, 7, 5.4].forEach((w, i) => {
      const h = 3;
      const slab = mesh(new THREE.BoxGeometry(w, h, w), i === 1 ? mat : stoneMat, 0, y + h / 2, 0);
      slab.rotation.y = i * 0.22;
      g.add(slab);
      /* 玻璃带 */
      const glass = mesh(new THREE.BoxGeometry(w + 0.08, 0.42, w + 0.08), mat, 0, y + h * 0.62, 0);
      glass.rotation.y = i * 0.22;
      g.add(glass);
      y += h + 0.35;
    });
    /* 顶部环 */
    const torus = mesh(new THREE.TorusGeometry(1.5, 0.1, 8, 48), glowMat('#8fd0ff', 0.9), 0, y + 1.2, 0, { cast: false });
    torus.rotation.x = Math.PI / 2;
    emissiveParts.push({ mat: torus.material, max: 1.8 });
    g.add(torus);
    g.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8), metalMat, 0, y + 0.6, 0));
    return g;
  }

  function buildNeuro() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(5, 5.4, 1.6, 24), stoneMat, 0, 0.8, 0));
    const mat = facadeMaterial({ base: '#c2b096', glass: '#39525c', cols: 8, rows: 2, lit: 0.7, seed: 33 });
    g.add(mesh(new THREE.CylinderGeometry(4.2, 4.6, 4.6, 24), mat, 0, 3.9, 0));

    /* 穹顶 */
    const domeMat = new THREE.MeshStandardMaterial({ color: 0xd9cfba, roughness: 0.5, metalness: 0.2 });
    const dome = mesh(new THREE.SphereGeometry(3.9, 32, 18, 0, Math.PI * 2, 0, Math.PI / 2), domeMat, 0, 6.2, 0);
    g.add(dome);

    /* 神经元节点与连线 */
    const nodeMat = glowMat('#7fe3d0', 0.6);
    const pts = [];
    const nodes = [];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const b = 0.35 + (i % 4) * 0.22;
      const v = new THREE.Vector3(
        Math.cos(a) * Math.cos(b) * 4.4,
        6.2 + Math.sin(b) * 4.4,
        Math.sin(a) * Math.cos(b) * 4.4
      );
      nodes.push(v);
      const s = mesh(new THREE.SphereGeometry(0.17, 10, 10), nodeMat, v.x, v.y, v.z, { cast: false });
      emissiveParts.push({ mat: s.material, max: 2.2 });
      g.add(s);
      pts.push(v);
    }
    const lineGeo = new THREE.BufferGeometry();
    const linePos = [];
    for (let i = 0; i < nodes.length; i++) {
      const j = (i * 5 + 3) % nodes.length;
      if (j === i) continue;
      linePos.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z);
    }
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0x7fe3d0, transparent: true, opacity: 0.35 });
    g.add(new THREE.LineSegments(lineGeo, lineMat));
    return g;
  }

  function buildCT() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(4.6, 5, 1.2, 32), stoneMat, 0, 0.6, 0));
    const mat = facadeMaterial({ base: '#c3c8c6', glass: '#3c5a66', cols: 7, rows: 5, lit: 0.55, seed: 44 });
    g.add(mesh(new THREE.CylinderGeometry(3.6, 3.9, 9.2, 32), mat, 0, 1.2 + 4.6, 0));

    /* 机架环 */
    const ringMesh = mesh(new THREE.TorusGeometry(4.4, 0.22, 12, 64), glowMat('#8fd6ff', 0.8), 0, 7.4, 0, { cast: false });
    ringMesh.rotation.x = Math.PI / 2;
    emissiveParts.push({ mat: ringMesh.material, max: 2.4 });
    g.add(ringMesh);
    g.rotation.y = 0.4;
    g.userData.spin = ringMesh;
    return g;
  }

  function buildSurgery() {
    const g = new THREE.Group();
    const mat = facadeMaterial({ base: '#d2c3a8', glass: '#465a64', cols: 6, rows: 3, lit: 0.6, seed: 55 });
    g.add(mesh(new THREE.BoxGeometry(12, 1, 8), stoneMat, 0, 0.5, 0));
    g.add(mesh(new THREE.BoxGeometry(10.4, 3.6, 6.6), mat, 0, 1 + 1.8, 0));
    g.add(mesh(new THREE.BoxGeometry(10.8, 0.4, 7), stoneDark, 0, 4.8, 0));

    /* 机械臂 */
    const arm = new THREE.Group();
    arm.position.set(0, 5, 0);
    const seg1 = mesh(new THREE.CylinderGeometry(0.34, 0.4, 3.4, 12), metalMat, 0, 1.7, 0);
    const joint = mesh(new THREE.SphereGeometry(0.46, 12, 12), stoneDark, 0, 3.5, 0);
    const pivot2 = new THREE.Group();
    pivot2.position.set(0, 3.4, 0);
    const seg2 = mesh(new THREE.CylinderGeometry(0.24, 0.3, 2.8, 12), metalMat, 0, 1.3, 0);
    seg2.rotation.z = 0.9;
    seg2.position.set(-1.1, 1.2, 0);
    const tip = mesh(new THREE.ConeGeometry(0.16, 0.7, 10), glowMat('#9ff0c8', 0.8), -2.2, 1.9, 0, { cast: false });
    emissiveParts.push({ mat: tip.material, max: 2 });
    pivot2.add(seg2, tip);
    arm.add(seg1, joint, pivot2);
    g.add(arm);
    g.userData.arm = arm;
    g.userData.pivot2 = pivot2;
    return g;
  }

  function buildNotes() {
    const g = new THREE.Group();
    const mat = facadeMaterial({ base: '#a89a82', glass: '#2c3a42', cols: 3, rows: 2, lit: 0.15, seed: 66 });
    g.add(mesh(new THREE.BoxGeometry(6.4, 1, 6.4), stoneMat, 0, 0.5, 0));
    g.add(mesh(new THREE.BoxGeometry(5, 3.2, 5), mat, 0, 2.6, 0));
    const roof = mesh(new THREE.CylinderGeometry(0, 4.4, 2.2, 4), stoneDark, 0, 5.3, 0);
    roof.rotation.y = Math.PI / 4;
    g.add(roof);
    return g;
  }

  function buildCar() {
    const g = new THREE.Group();
    const mat = facadeMaterial({ base: '#cfc0a4', glass: '#3f5563', cols: 6, rows: 3, lit: 0.5, seed: 77 });
    g.add(mesh(new THREE.BoxGeometry(12, 1, 9), stoneMat, 0, 0.5, 0));
    g.add(mesh(new THREE.BoxGeometry(10.4, 3.4, 6.4), mat, 0, 2.7, 0));
    g.add(mesh(new THREE.BoxGeometry(10.8, 0.35, 6.8), stoneDark, 0, 4.6, 0));

    /* 车库门 */
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x6a6255, roughness: 0.8, metalness: 0.2 });
    g.add(mesh(new THREE.BoxGeometry(4.6, 2.4, 0.2), doorMat, 0, 2.2, 3.3));

    /* 小车 */
    const car = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xb4462f, roughness: 0.5, metalness: 0.3 });
    car.add(mesh(new THREE.BoxGeometry(2.8, 0.7, 1.5), bodyMat, 0, 0.62, 0));
    car.add(mesh(new THREE.BoxGeometry(1.4, 0.5, 1.3), new THREE.MeshStandardMaterial({ color: 0x2b3a44, roughness: 0.3, metalness: 0.5 }), -0.15, 1.15, 0));
    const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.26, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1d1f22, roughness: 0.9 });
    [[-0.95, 0.8], [0.95, 0.8], [-0.95, -0.8], [0.95, -0.8]].forEach(function (xz) {
      const w = mesh(wheelGeo, wheelMat, xz[0], 0.34, xz[1]);
      w.rotation.x = Math.PI / 2;
      car.add(w);
    });
    car.position.set(-1.2, 0, 6.4);
    car.rotation.y = -0.3;
    g.add(car);
    g.userData.car = car;

    /* 赛道弧线 */
    const track = mesh(new THREE.TorusGeometry(7.2, 0.32, 8, 48, Math.PI * 1.4), new THREE.MeshStandardMaterial({ color: 0x3f3a33, roughness: 1 }), 0, 0.08, 0, { cast: false });
    track.rotation.x = Math.PI / 2;
    track.rotation.z = -0.5;
    g.add(track);
    return g;
  }

  function buildLab() {
    const g = new THREE.Group();
    const mat = facadeMaterial({ base: '#cdbfa8', glass: '#39525c', cols: 4, rows: 4, lit: 0.72, seed: 88 });
    g.add(mesh(new THREE.BoxGeometry(9, 1, 9), stoneMat, 0, 0.5, 0));
    g.add(mesh(new THREE.BoxGeometry(7.6, 5.2, 7.6), mat, 0, 3.6, 0));
    g.add(mesh(new THREE.BoxGeometry(8, 0.4, 8), stoneDark, 0, 6.4, 0));

    /* 屋顶龙门架 */
    g.add(mesh(new THREE.BoxGeometry(6.4, 0.26, 0.26), metalMat, 0, 8, 0));
    g.add(mesh(new THREE.BoxGeometry(0.26, 1.6, 0.26), metalMat, -3, 7.2, 0));
    g.add(mesh(new THREE.BoxGeometry(0.26, 1.6, 0.26), metalMat, 3, 7.2, 0));
    g.add(mesh(new THREE.BoxGeometry(0.7, 0.7, 0.9), metalMat, 0, 7.4, 0));

    /* 烟囱与灯带 */
    g.add(mesh(new THREE.CylinderGeometry(0.42, 0.5, 3, 10), stoneDark, 2.9, 7.9, -2.6));
    const strip = mesh(new THREE.BoxGeometry(0.14, 0.14, 6.6), glowMat('#9fe6d0', 0.8), 3.86, 3.4, 0, { cast: false });
    emissiveParts.push({ mat: strip.material, max: 2 });
    g.add(strip);

    /* 门口实验台 */
    g.add(mesh(new THREE.BoxGeometry(2.6, 0.14, 1.4), stoneDark, 0, 1.05, 4.5));
    return g;
  }

  function buildCourse() {
    const g = new THREE.Group();
    const mat = facadeMaterial({ base: '#d6c8ae', glass: '#43585f', cols: 7, rows: 4, lit: 0.45, seed: 99 });
    g.add(mesh(new THREE.BoxGeometry(11, 1, 8), stoneMat, 0, 0.5, 0));
    g.add(mesh(new THREE.BoxGeometry(9.6, 5.4, 6.6), mat, 0, 3.7, 0));
    g.add(mesh(new THREE.BoxGeometry(10, 0.4, 7), stoneDark, 0, 6.6, 0));

    /* 钟楼 */
    g.add(mesh(new THREE.BoxGeometry(2.6, 9, 2.6), mat, -3.4, 5.5, 0));
    g.add(mesh(new THREE.BoxGeometry(3, 0.4, 3), stoneDark, -3.4, 10.2, 0));
    const roof = mesh(new THREE.CylinderGeometry(0, 2.2, 2.4, 4), stoneDark, -3.4, 11.6, 0);
    roof.rotation.y = Math.PI / 4;
    g.add(roof);

    /* 钟面 */
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.72, 24), glowMat('#ffe3b0', 0.9));
    face.position.set(-3.4, 8.4, 1.33);
    emissiveParts.push({ mat: face.material, max: 1.6 });
    g.add(face);
    return g;
  }

  const builders = {
    english: buildEnglish, modeling: buildModeling, neuro: buildNeuro,
    ct: buildCT, surgery: buildSurgery, car: buildCar, lab: buildLab,
    course: buildCourse, notes: buildNotes
  };

  const buildings = [];
  const pickables = [];

  /* ---------- 每栋楼的差异化细节：屋顶、附属体、招牌 ---------- */
  function decorate(id, g) {
    function add(geo, mat, x, y, z, rot) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      if (rot) m.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
      m.castShadow = true;
      m.receiveShadow = true;
      g.add(m);
      return m;
    }

    if (id === 'english') {
      /* 玻璃翼楼 + 屋顶天线 + 招牌 */
      const wing = add(new THREE.BoxGeometry(4.2, 6.4, 5.2), facadeMaterial({ base: '#d9cdb6', glass: '#4a6570', cols: 3, rows: 5, lit: 0.45, seed: 121 }), -5.4, 3.2, 2.2, [0, 0.18, 0]);
      wing.receiveShadow = true;
      add(new THREE.CylinderGeometry(0.06, 0.06, 4.2, 6), metalMat, 2.6, 13.4, -2.2);
      add(new THREE.SphereGeometry(0.18, 8, 8), glowMat('#ff9a6a', 1), 2.6, 15.6, -2.2);
      add(new THREE.BoxGeometry(3.4, 0.9, 0.14), glowMat('#ffd8a8', 0.5), 0, 10.2, 4.12);
    }

    if (id === 'modeling') {
      /* 楼梯核心筒 + 屋顶水箱 + 侧面挑檐 */
      add(new THREE.CylinderGeometry(1.5, 1.5, 12.4, 16), stoneDark, 3.8, 6.2, 3.8);
      add(new THREE.CylinderGeometry(1.05, 1.05, 1.9, 14), metalMat, -3.4, 12.2, -3.2);
      add(new THREE.BoxGeometry(5.6, 0.22, 1.4), stoneDark, 0, 6.4, 4.6);
      const ring2 = add(new THREE.TorusGeometry(1.6, 0.08, 6, 32), glowMat('#8fd0ff', 1), 0, 11.8, 0, [Math.PI / 2, 0, 0]);
      emissiveParts.push({ mat: ring2.material, max: 1.6 });
    }

    if (id === 'neuro') {
      /* 侧厅 + 天线碟 + 冷却管 */
      add(new THREE.BoxGeometry(4.6, 3.4, 5.2), facadeMaterial({ base: '#c8b79c', glass: '#37505a', cols: 4, rows: 2, lit: 0.6, seed: 131 }), -5.6, 1.7, 1.4, [0, -0.2, 0]);
      add(new THREE.CylinderGeometry(0.07, 0.07, 3.4, 6), metalMat, 3.2, 9.2, -2.4);
      const dish = add(new THREE.SphereGeometry(1.05, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.42), metalMat, 3.2, 11.2, -2.4);
      dish.rotation.x = -0.9;
      const pipe = add(new THREE.CylinderGeometry(0.16, 0.16, 3.2, 10), metalMat, 4.4, 1.6, 3.4);
      pipe.rotation.x = Math.PI / 2;
    }

    if (id === 'ct') {
      /* 入口雨棚 + 两侧机房 + 屋顶排风 */
      add(new THREE.BoxGeometry(7.2, 0.24, 3.2), stoneDark, 0, 3.1, 5.2);
      [-5.2, 5.2].forEach((x) => {
        add(new THREE.BoxGeometry(3.6, 2.6, 4.4), stoneMat, x, 1.3, -1.6);
      });
      add(new THREE.BoxGeometry(1.4, 1.1, 1.4), metalMat, -1.4, 10.6, 0);
      add(new THREE.BoxGeometry(1.4, 1.1, 1.4), metalMat, 0.6, 10.6, -1.2);
    }

    if (id === 'surgery') {
      /* 屋顶停机坪 + 侧翼 + 指示灯 */
      const pad = add(new THREE.CylinderGeometry(3.2, 3.2, 0.18, 32), stoneDark, 0, 5.1, 0);
      pad.receiveShadow = true;
      add(new THREE.BoxGeometry(0.5, 0.06, 2.2), glowMat('#ffffff', 0.4), 0, 5.24, 0, [0, Math.PI / 2, 0]);
      add(new THREE.BoxGeometry(2.2, 0.06, 0.5), glowMat('#ffffff', 0.4), 0, 5.24, 0);
      add(new THREE.BoxGeometry(3.2, 2.8, 6.6), stoneMat, -6.6, 1.4, 0);
      [[-6.6, 4.2], [6.6, 4.2]].forEach(([x, z]) => add(new THREE.SphereGeometry(0.16, 8, 8), glowMat('#ff6a5a', 1.4), x, 5.4, z));
    }

    if (id === 'car') {
      /* 加油站式雨棚 + 招牌 + 轮胎堆 */
      add(new THREE.BoxGeometry(9.4, 0.3, 5.4), metalMat, 0, 4.4, 8.2);
      [-4.2, 4.2].forEach((x) => add(new THREE.CylinderGeometry(0.12, 0.12, 4.4, 8), metalMat, x, 2.2, 8.2));
      add(new THREE.BoxGeometry(0.2, 2.2, 0.2), metalMat, 5.6, 2.6, 6.4);
      add(new THREE.BoxGeometry(2.2, 1.1, 0.14), glowMat('#ffb066', 0.9), 5.6, 4.1, 6.4);
      [[-5.2, 6.4], [-4.4, 6.9]].forEach(([x, z]) => {
        const tire = add(new THREE.TorusGeometry(0.34, 0.12, 8, 16), new THREE.MeshStandardMaterial({ color: 0x1d1f22, roughness: 1 }), x, 0.34, z, [Math.PI / 2, 0, 0]);
        tire.castShadow = true;
      });
    }

    if (id === 'lab') {
      /* 屋顶太阳能板 + 外挂管道 + 通风口 */
      const panel = add(new THREE.BoxGeometry(4.2, 0.08, 3.2), new THREE.MeshStandardMaterial({ color: 0x2f3f52, roughness: 0.35, metalness: 0.5 }), -1.4, 6.9, 1.2, [-0.28, 0.2, 0]);
      panel.receiveShadow = true;
      const pipe = add(new THREE.CylinderGeometry(0.2, 0.2, 5.4, 10), metalMat, -3.9, 3.2, -1.2);
      pipe.rotation.z = Math.PI / 2;
      [-2.2, 2.2].forEach((x) => add(new THREE.BoxGeometry(0.9, 0.7, 0.5), metalMat, x, 5.4, -3.6));
    }

    if (id === 'course') {
      /* 侧翼教学楼 + 旗杆 + 台阶 */
      add(new THREE.BoxGeometry(5.4, 4.2, 6.2), facadeMaterial({ base: '#d2c4aa', glass: '#42565d', cols: 4, rows: 3, lit: 0.5, seed: 141 }), 6.6, 2.6, -0.6, [0, 0.12, 0]);
      add(new THREE.CylinderGeometry(0.06, 0.06, 5.6, 6), metalMat, -6.4, 2.8, 3.2);
      add(new THREE.BoxGeometry(1.5, 0.9, 0.06), glowMat('#e8d8b8', 0.3), -6.4, 5.2, 3.2);
      add(new THREE.BoxGeometry(9.2, 0.5, 1.4), stoneMat, 0, 0.25, 5.2);
    }

    if (id === 'notes') {
      /* 小院栅栏与门 */
      for (let i = -3; i <= 3; i++) {
        add(new THREE.BoxGeometry(0.12, 1.0, 0.12), stoneDark, i * 1.1, 0.5, 4.2);
      }
      add(new THREE.BoxGeometry(7.4, 0.1, 0.1), stoneDark, 0, 1.0, 4.2);
      add(new THREE.BoxGeometry(1.2, 1.7, 0.12), stoneDark, -1.4, 0.85, 4.2);
    }
  }

  MODULES.forEach((mod, i) => {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / NS;
    const x = Math.cos(a) * RADIUS;
    const z = Math.sin(a) * RADIUS;

    const g = builders[mod.id]();
    decorate(mod.id, g);
    g.position.set(x, 0, z);
    g.rotation.y = -a + Math.PI / 2;
    g.userData.module = mod;
    g.userData.id = mod.id;
    g.traverse((o) => {
      if (o.isMesh) { o.userData.id = mod.id; pickables.push(o); }
    });

    /* 底座圆盘 */
    const pad = mesh(new THREE.CylinderGeometry(7.4, 7.8, 0.4, 40), stoneDark, 0, 0.2, 0, { cast: false });
    g.add(pad);

    scene.add(g);

    const top = new THREE.Box3().setFromObject(g).max.y;
    buildings.push({
      mod, group: g,
      anchor: new THREE.Vector3(x, top + 2.6 + (i % 3) * 1.9, z),
      focus: new THREE.Vector3(x * 0.55, 5.5, z * 0.55)
    });
  });

  /* ---------- 树 ---------- */
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b5236, roughness: 1 });
  const leafMats = [0x5f7a4e, 0x6f8855, 0x4f6b46].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 1 }));
  const treeRand = mulberry32(99);
  for (let i = 0; i < 46; i++) {
    const a = treeRand() * Math.PI * 2;
    const r = 32 + treeRand() * 34;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (Math.abs(x) < 24 && Math.abs(z) < 24) continue;
    const s = 0.7 + treeRand() * 0.6;
    const t = new THREE.Group();
    t.add(mesh(new THREE.CylinderGeometry(0.16 * s, 0.22 * s, 1.8 * s, 6), trunkMat, 0, 0.9 * s, 0));
    const crown = mesh(new THREE.ConeGeometry(1.5 * s, 3.6 * s, 7), leafMats[i % 3], 0, 2.9 * s, 0);
    t.add(crown);
    t.position.set(x, 0, z);
    t.rotation.y = treeRand() * Math.PI;
    scene.add(t);
  }

  /* ---------- 路灯 ---------- */
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const x = Math.cos(a) * 13.2;
    const z = Math.sin(a) * 13.2;
    const post = mesh(new THREE.CylinderGeometry(0.1, 0.14, 4.6, 8), metalMat, x, 2.3, z);
    scene.add(post);
    const headMat = glowMat('#ffd9a0', 0.2);
    const head = mesh(new THREE.SphereGeometry(0.26, 12, 12), headMat, x, 4.7, z, { cast: false });
    scene.add(head);
    lampMats.push(headMat);

    const pl = new THREE.PointLight(0xffc98a, 0, 20, 2);
    pl.position.set(x, 4.6, z);
    scene.add(pl);
    lampLights.push(pl);
  }

  const labelHost = document.getElementById('labels');

  /* ---------- 街道细部：人行道、车道虚线、斑马线 ---------- */
  const walkMat = new THREE.MeshStandardMaterial({ color: 0xb8ac93, roughness: 1 });
  [14.6, 22.6].forEach((r) => {
    const walk = new THREE.Mesh(new THREE.RingGeometry(r, r + 1.7, 96), walkMat);
    walk.rotation.x = -Math.PI / 2;
    walk.position.y = 0.03;
    walk.receiveShadow = true;
    scene.add(walk);
  });

  const paintMat = new THREE.MeshStandardMaterial({ color: 0xe6dcc4, roughness: 0.9 });
  const dashGeo = new THREE.PlaneGeometry(0.22, 1.7);
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 3;
    for (let d = 0; d < 4; d++) {
      const r = 13 + d * 2.6;
      const dash = new THREE.Mesh(dashGeo, paintMat);
      dash.rotation.x = -Math.PI / 2;
      dash.rotation.z = -a;
      dash.position.set(Math.cos(a) * r, 0.04, Math.sin(a) * r);
      scene.add(dash);
    }
    /* 斑马线 */
    for (let k = 0; k < 5; k++) {
      const zebra = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 2.6), paintMat);
      zebra.rotation.x = -Math.PI / 2;
      zebra.rotation.z = -a;
      const off = (k - 2) * 0.95;
      zebra.position.set(
        Math.cos(a) * 12 - Math.sin(a) * off,
        0.041,
        Math.sin(a) * 12 + Math.cos(a) * off
      );
      scene.add(zebra);
    }
  }

  /* ---------- 行人 ---------- */
  const pedGroup = new THREE.Group();
  scene.add(pedGroup);
  const pedMeshes = [];
  const peds = [];
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xe6c6a8, roughness: 0.85 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x2c2620, roughness: 0.9 });

  PEDS.forEach((cfg, i) => {
    const g = new THREE.Group();
    const cloth = new THREE.MeshStandardMaterial({ color: new THREE.Color(cfg.color), roughness: 0.9 });

    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.44, 4, 10), cloth);
    body.position.y = 0.96;
    body.castShadow = true;
    body.userData.ped = cfg;
    g.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.145, 12, 10), skinMat);
    head.position.y = 1.34;
    head.castShadow = true;
    head.userData.ped = cfg;
    g.add(head);

    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.152, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.62), hairMat);
    hair.position.y = 1.36;
    g.add(hair);

    const legs = [];
    [-0.085, 0.085].forEach((x) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.42, 0.09), new THREE.MeshStandardMaterial({ color: 0x3a3a3f, roughness: 1 }));
      leg.position.set(x, 0.22, 0);
      leg.userData.ped = cfg;
      g.add(leg);
      legs.push(leg);
    });

    const r = 14.6 + (i % 3) * 1.2;
    const a0 = (i / PEDS.length) * Math.PI * 2 + (i % 2) * 0.3;
    const dir = i % 4 === 0 ? -1 : 1;
    const speed = (0.055 + (i % 5) * 0.012) * dir;

    pedGroup.add(g);
    pedMeshes.push(body, head);
    peds.push({
      cfg, g, legs, r, a: a0, speed, phase: i * 1.7, bob: 0.02 + (i % 3) * 0.006,
      route: i % 3 === 0 ? 'avenue' : 'ring',
      ang: -Math.PI / 2 + (i % 6) * (Math.PI / 3),
      s: 14 + (i % 5) * 2.6,
      dir: i % 2 ? 1 : -1,
      v: 0.9 + (i % 4) * 0.22
    });
  });

  /* 行人的名字标签 */
  peds.forEach((p) => {
    const el = document.createElement('div');
    el.className = 'label ped';
    el.innerHTML = '<b>' + p.cfg.name + '</b>';
    labelHost.appendChild(el);
    p.el = el;
  });

  /* ---------- 标签 ---------- */
  buildings.forEach((b) => {
    const el = document.createElement('div');
    el.className = 'label' + (b.mod.status === 'soon' ? ' soon' : '');
    el.innerHTML = '<b>' + b.mod.title + '</b>';
    labelHost.appendChild(el);
    b.el = el;
  });

  /* ---------- 交互 ---------- */
  const ray = new THREE.Raycaster();
  const pointer = new THREE.Vector2(-10, -10);
  let hovered = null;
  let selected = null;
  let hoveredPed = null;
  let pointerDirty = false;

  let mode = 'city';
  let room = null;
  let hoveredHot = null;
  const ROOM_IDS = { course: '课程', modeling: '论文' };

  renderer.domElement.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    pointerDirty = true;
  });

  function activeScene() { return mode === 'room' ? room.scene : scene; }

  function pick() {
    ray.setFromCamera(pointer, camera);

    if (mode === 'room') {
      const hit = ray.intersectObjects(room.hotspots, false)[0];
      hoveredHot = hit ? hit.object.userData.item : null;
      renderer.domElement.style.cursor = hoveredHot ? 'pointer' : 'default';
      return;
    }

    const hits = ray.intersectObjects(pickables.concat(pedMeshes), false);
    const first = hits[0];
    const ped = first && first.object.userData.ped ? first.object.userData.ped : null;
    const id = first && first.object.userData.id ? first.object.userData.id : null;
    const b = id ? buildings.find((x) => x.mod.id === id) : null;

    if (ped !== hoveredPed) {
      hoveredPed = ped;
      peds.forEach((x) => x.el.classList.toggle('active', x.cfg === ped));
    }
    if (b !== hovered) {
      hovered = b;
      buildings.forEach((x) => x.el.classList.toggle('active', x === b));
    }
    renderer.domElement.style.cursor = (ped || (b && (b.mod.href || ROOM_IDS[b.mod.id]))) ? 'pointer' : 'default';
  }

  const card = document.getElementById('card');
  function showCard(o) {
    document.getElementById('cardTag').textContent = o.tag || '';
    document.getElementById('cardTitle').textContent = o.title || '';
    document.getElementById('cardDesc').textContent = o.desc || '';
    const go = document.getElementById('cardGo');
    if (o.href) { go.href = o.href; go.textContent = o.hrefText || '进入'; go.style.display = ''; }
    else { go.style.display = 'none'; }
    card.hidden = false;
  }
  function closeCard() {
    selected = null;
    hoveredHot = null;
    card.hidden = true;
  }
  document.getElementById('cardClose').addEventListener('click', closeCard);

  /* ---------- 进出房间 ---------- */
  const exitBtn = document.getElementById('exitRoom');
  const bottomBar = document.querySelector('.hud.bottom');
  const hintEl = document.getElementById('hint');

  function enterRoom(id) {
    if (!room || room.id !== id) {
      room = createRoom(THREE, id);
      room.id = id;
      room.labels = room.anchors.map((a) => {
        const el = document.createElement('div');
        el.className = 'label room';
        el.innerHTML = '<b>' + a.title + '</b>';
        el.style.display = qr ? '' : 'none';
        labelHost.appendChild(el);
        return { el, pos: a.pos };
      });
      room.scene.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    }
    mode = 'room';
    closeCard();
    selected = null;
    hovered = null;
    buildings.forEach((b) => { b.el.style.display = 'none'; });
    peds.forEach((x) => { x.el.style.display = 'none'; });
    room.labels.forEach((l) => { l.el.style.display = ''; });
    camera.position.set(0, 2.55, 6.2);
    controls.target.set(0, 2.15, -3.0);
    controls.minDistance = 5;
    controls.maxDistance = 15;
    controls.maxPolarAngle = Math.PI * 0.54;
    card.hidden = true;
    if (exitBtn) exitBtn.hidden = false;
    if (bottomBar) bottomBar.style.display = 'none';
    if (hintEl) { hintEl.textContent = '拖动环视 · 点击书本或论文打开'; hintEl.style.opacity = '1'; }
    controls.update();
  }

  function exitRoom() {
    mode = 'city';
    closeCard();
    hoveredHot = null;
    camera.position.set(0, 23, 76);
    controls.target.set(0, 8, 0);
    controls.minDistance = 20;
    controls.maxDistance = 150;
    controls.maxPolarAngle = Math.PI * 0.487;
    buildings.forEach((b) => { b.el.style.display = ''; });
    peds.forEach((x) => { x.el.style.display = ''; });
    if (room) room.labels.forEach((l) => { l.el.style.display = 'none'; });
    if (exitBtn) exitBtn.hidden = true;
    if (bottomBar) bottomBar.style.display = '';
    if (hintEl) hintEl.textContent = '拖动旋转 · 滚轮缩放 · 点击建筑';
    controls.update();
  }

  if (exitBtn) exitBtn.addEventListener('click', exitRoom);

  renderer.domElement.addEventListener('pointerdown', () => { pointerDirty = true; });
  renderer.domElement.addEventListener('click', () => {
    pick();
    if (mode === 'room') {
      if (hoveredHot) showCard(hoveredHot);
      else closeCard();
      return;
    }
    if (hoveredPed) {
      showCard({ tag: '行人', title: hoveredPed.name, desc: hoveredPed.note });
      return;
    }
    if (!hovered) { closeCard(); return; }
    if (ROOM_IDS[hovered.mod.id]) { enterRoom(hovered.mod.id); return; }
    showCard({ tag: hovered.mod.tag, title: hovered.mod.title, desc: hovered.mod.desc, href: hovered.mod.href });
  });

  /* ---------- 时间 ---------- */
  let hour = START_HOUR;
  let playing = true;
  /* 支持 ?h=22 直接定格在某个时刻，方便截图分享 */
  const qh = parseFloat(new URLSearchParams(location.search).get('h'));
  if (!Number.isNaN(qh)) hour = clamp(qh, 0, 23.99);
  const DAY_SECONDS = 150;
  const range = document.getElementById('timeRange');
  const clockEl = document.getElementById('clock');
  const playBtn = document.getElementById('playBtn');

  function fmtHour(h) {
    const hh = Math.floor(h) % 24;
    const mm = Math.floor((h % 1) * 60);
    return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
  }

  const PAL = {
    dayTop: new THREE.Color('#6fa3cf'), dayBot: new THREE.Color('#e9eef2'),
    duskTop: new THREE.Color('#5a6690'), duskBot: new THREE.Color('#e79a63'),
    nightTop: new THREE.Color('#0b1224'), nightBot: new THREE.Color('#1e2a44'),
    sunLow: new THREE.Color('#ffb27a'), sunHigh: new THREE.Color('#fff6e8'),
    hemiNight: new THREE.Color('#1b2a44'), hemiDay: new THREE.Color('#bcd8f0'),
    groundNight: new THREE.Color('#1a1712'), groundDay: new THREE.Color('#6f6047')
  };
  const cTop = new THREE.Color();
  const cBot = new THREE.Color();
  const cTmp = new THREE.Color();

  /* 光照关键帧：按太阳高度角插值，正午到午夜都不至于过暗或发灰 */
  const KEYS = [
    { e: -0.70, top: '#04060d', bot: '#0b1220', sun: 0.00, hemi: 0.26, exp: 1.40, warm: 0.00 },
    { e: -0.18, top: '#0d1526', bot: '#1d2740', sun: 0.00, hemi: 0.30, exp: 1.34, warm: 0.15 },
    { e: -0.02, top: '#2a3350', bot: '#6a4a5e', sun: 0.30, hemi: 0.32, exp: 1.20, warm: 0.65 },
    { e: 0.05, top: '#5b6690', bot: '#e08048', sun: 1.00, hemi: 0.36, exp: 1.10, warm: 1.00 },
    { e: 0.20, top: '#6a86ae', bot: '#eeba8b', sun: 2.20, hemi: 0.42, exp: 1.05, warm: 0.85 },
    { e: 0.45, top: '#74a4cd', bot: '#e7e2d6', sun: 3.20, hemi: 0.50, exp: 1.02, warm: 0.35 },
    { e: 0.78, top: '#659ecd', bot: '#e7eff5', sun: 3.60, hemi: 0.56, exp: 1.00, warm: 0.10 },
    { e: 1.00, top: '#5d98cf', bot: '#e9f1f7', sun: 3.70, hemi: 0.58, exp: 0.98, warm: 0.00 }
  ].map((k) => ({ e: k.e, sun: k.sun, hemi: k.hemi, exp: k.exp, warm: k.warm, topC: new THREE.Color(k.top), botC: new THREE.Color(k.bot) }));

  const kTop = new THREE.Color();
  const kBot = new THREE.Color();

  function sampleKeys(e) {
    let i = 0;
    while (i < KEYS.length - 2 && e > KEYS[i + 1].e) i++;
    const a = KEYS[i], b = KEYS[i + 1];
    const t = clamp((e - a.e) / (b.e - a.e), 0, 1);
    const m = t * t * (3 - 2 * t);
    kTop.copy(a.topC).lerp(b.topC, m);
    kBot.copy(a.botC).lerp(b.botC, m);
    return {
      sun: a.sun + (b.sun - a.sun) * m,
      hemi: a.hemi + (b.hemi - a.hemi) * m,
      exp: a.exp + (b.exp - a.exp) * m,
      warm: a.warm + (b.warm - a.warm) * m
    };
  }

  function applyTime(h) {
    const t = ((h - 6) / 24) * Math.PI * 2;
    const sy = Math.sin(t);
    const sx = Math.cos(t);

    sun.position.set(sx * 90, sy * 90, 42);
    sun.target.position.set(0, 0, 0);

    const k = sampleKeys(sy);
    const nightW = 1 - smoothstep(-0.16, 0.06, sy);

    skyUniforms.topColor.value.copy(kTop);
    skyUniforms.bottomColor.value.copy(kBot);
    skyUniforms.sunDir.value.set(sx, sy, 0.45).normalize();
    skyUniforms.sunColor.value.copy(PAL.sunLow).lerp(PAL.sunHigh, 1 - k.warm);
    skyUniforms.glow.value = 0.2 + Math.max(0, sy) * 1.4;

    fog.color.copy(kBot).lerp(kTop, 0.22);

    sun.intensity = k.sun;
    sun.color.copy(PAL.sunHigh).lerp(PAL.sunLow, k.warm);
    moon.intensity = nightW * 0.45;
    hemi.intensity = k.hemi;
    hemi.color.copy(PAL.hemiNight).lerp(PAL.hemiDay, smoothstep(-0.1, 0.5, sy));
    hemi.groundColor.copy(PAL.groundNight).lerp(PAL.groundDay, smoothstep(-0.1, 0.5, sy));

    starMat.opacity = nightW * 0.9;

    const winI = 0.04 + nightW * 1.6;
    facades.forEach((m) => { m.emissiveIntensity = winI; });
    emissiveParts.forEach((p) => { p.mat.emissiveIntensity = 0.12 + p.max * nightW; });
    lampMats.forEach((m) => { m.emissiveIntensity = 0.08 + nightW * 2.8; });
    lampLights.forEach((l) => { l.intensity = nightW * 7; });

    renderer.toneMappingExposure = k.exp;
    clockEl.textContent = fmtHour(h);
    range.value = String(h);
  }

  range.addEventListener('input', () => {
    hour = parseFloat(range.value);
    applyTime(hour);
  });
  playBtn.addEventListener('click', () => {
    playing = !playing;
    playBtn.textContent = playing ? '⏸' : '▶';
    playBtn.setAttribute('aria-label', playing ? '暂停昼夜循环' : '继续昼夜循环');
  });

  const rotateBtn = document.getElementById('rotateBtn');
  rotateBtn.addEventListener('click', () => {
    controls.autoRotate = !controls.autoRotate;
    rotateBtn.setAttribute('aria-pressed', controls.autoRotate ? 'true' : 'false');
  });

  /* 列表模式 */
  const listBtn = document.getElementById('listBtn');
  const fallbackEl = document.getElementById('fallback');
  listBtn.addEventListener('click', () => {
    const on = fallbackEl.hidden;
    fallbackEl.hidden = !on;
    listBtn.textContent = on ? '返回城市' : '列表模式';
    if (on) showFallback('');
  });

  /* ---------- 动画 ---------- */
  const clock = new THREE.Clock();
  const tmpV = new THREE.Vector3();
  const tmpPed = new THREE.Vector3();
  let intro = 0;
  const introFrom = camera.position.clone();
  const introTo = new THREE.Vector3(0, 23, 76);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) intro = 1;

  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05);

    if (playing) {
      hour = (hour + (dt * 24) / DAY_SECONDS) % 24;
      applyTime(hour);
    }

    /* 开场镜头 */
    if (intro < 1) {
      intro = Math.min(1, intro + dt / 2.4);
      const e = 1 - Math.pow(1 - intro, 3);
      camera.position.lerpVectors(introFrom, introTo, e);
      controls.target.lerp(new THREE.Vector3(0, 8, 0), 0.06);
    }

    /* 选中时镜头靠近（房间里不动镜头） */
    if (mode === 'city') {
      if (selected) controls.target.lerp(selected.focus, 0.04);
      else controls.target.lerp(new THREE.Vector3(0, 8, 0), 0.02);
    }

    /* 行人走动 */
    if (mode === 'city') {
      peds.forEach((p) => {
        let dx, dz;
        if (p.route === 'ring') {
          p.a += p.speed * dt;
          p.g.position.set(Math.cos(p.a) * p.r, 0, Math.sin(p.a) * p.r);
          dx = -Math.sin(p.a) * p.speed;
          dz = Math.cos(p.a) * p.speed;
        } else {
          p.s += p.dir * p.v * dt;
          if (p.s > 30) { p.s = 30; p.dir = -1; }
          if (p.s < 13) { p.s = 13; p.dir = 1; }
          p.g.position.set(Math.cos(p.ang) * p.s, 0, Math.sin(p.ang) * p.s);
          dx = Math.cos(p.ang) * p.dir;
          dz = Math.sin(p.ang) * p.dir;
        }
        p.g.rotation.y = Math.atan2(dx, dz);
        const swing = Math.sin(clock.elapsedTime * 6 + p.phase) * 0.5;
        p.legs[0].rotation.x = swing;
        p.legs[1].rotation.x = -swing;
        p.g.position.y = Math.abs(Math.sin(clock.elapsedTime * 6 + p.phase)) * p.bob;
      });
    }

    /* 动的东西 */
    buildings.forEach((b) => {
      const spin = b.group.userData.spin;
      if (spin) spin.rotation.z += dt * 0.5;
    });
    const surgery = buildings.find((b) => b.mod.id === 'surgery');
    if (surgery && surgery.group.userData.pivot2) {
      surgery.group.userData.pivot2.rotation.z = Math.sin(clock.elapsedTime * 0.6) * 0.18;
    }

    if (pointerDirty) { pick(); pointerDirty = false; }
    if (mode === 'room' && room) room.update(dt);

    /* 标签投影 */
    function place(el, v3, opacity) {
      tmpV.copy(v3).project(camera);
      const on = tmpV.z < 1 && Math.abs(tmpV.x) < 1.2 && Math.abs(tmpV.y) < 1.2;
      el.style.opacity = on ? String(opacity) : '0';
      el.style.transform = 'translate(-50%,-50%) translate(' +
        ((tmpV.x * 0.5 + 0.5) * window.innerWidth) + 'px,' +
        ((-tmpV.y * 0.5 + 0.5) * window.innerHeight) + 'px)';
    }

    if (mode === 'city') {
      const slots = [];
      buildings.forEach((b) => slots.push({
        el: b.el, v: b.anchor, op: hovered === b || selected === b ? 1 : 0.78, pr: hovered === b ? 0 : 1
      }));
      peds.forEach((p) => {
        if (hoveredPed !== p.cfg) { p.el.style.opacity = '0'; return; }
        slots.push({
          el: p.el, v: tmpPed.set(p.g.position.x, 1.75 + p.g.position.y, p.g.position.z),
          op: 1, pr: 0
        });
      });
      slots.sort((a, b) => a.pr - b.pr);
      const used = [];
      slots.forEach((slot) => {
        tmpV.copy(slot.v).project(camera);
        if (tmpV.z >= 1 || Math.abs(tmpV.x) > 1.2 || Math.abs(tmpV.y) > 1.2) {
          slot.el.style.opacity = '0';
          return;
        }
        const x = (tmpV.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-tmpV.y * 0.5 + 0.5) * window.innerHeight;
        const w = (slot.el.offsetWidth || 90) + 8;
        const h = 26;
        let placedY = null;
        for (const off of [0, -26, 26, -52, 52, -78]) {
          const yy = y + off;
          const hit = used.some((r) => Math.abs(r.x - x) < (r.w + w) / 2 && Math.abs(r.y - yy) < (r.h + h) / 2);
          if (!hit) { placedY = yy; break; }
        }
        if (placedY === null) { slot.el.style.opacity = '0'; return; }
        used.push({ x, y: placedY, w, h });
        slot.el.style.opacity = String(slot.op);
        slot.el.style.transform = 'translate(-50%,-50%) translate(' + x + 'px,' + placedY + 'px)';
      });
    } else if (room) {
      room.labels.forEach((l) => place(l.el, l.pos, hoveredHot && hoveredHot.title.indexOf(l.title) >= 0 ? 1 : 0.66));
    }

    controls.update();
    renderer.render(activeScene(), camera);
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCard();
  });

  applyTime(hour);
  tick();

  /* ?room=course / ?room=modeling 直接进房间，方便分享和测试 */
  const qr = new URLSearchParams(location.search).get('room');
  if (qr && ROOM_IDS[qr]) setTimeout(function () { enterRoom(qr); }, 60);
  requestAnimationFrame(() => {
    const load = document.getElementById('loading');
    load.classList.add('done');
    setTimeout(() => { load.remove(); }, 900);
    setTimeout(() => { document.getElementById('hint').style.opacity = '0'; }, 7000);
  });
}
