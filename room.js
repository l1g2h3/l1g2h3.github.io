/* =========================================================
   室内场景 — 从城市点进建筑之后的第二层
   createRoom(THREE, id) → { scene, hotspots, anchors, update }
   hotspots 里的 mesh 带 userData.item，供射线拾取。
   ========================================================= */

const COURSES = [
  { title: 'Stable Diffusion', note: '扩散模型笔记', color: '#6f7f95' }
];

const PAPERS = [
  {
    title: '2025 国赛', sub: 'NIPT 时点选择',
    href: 'media/modeling/25-guosai.pdf',
    desc: '用 Gamma 分布回归刻画胎儿 Y 染色体浓度与孕周、BMI 的关系，再按 BMI 分组做风险优化，给出无创产前检测的建议时点与异常判定。48 页。'
  },
  {
    title: '2025 校赛 A', sub: '输尿管流量—压降',
    href: 'media/modeling/25-guosai-school-a.pdf',
    desc: '把巨大肾积水的输尿管流量—压降关系做成灰箱模型：泊肃叶定律加修正项，再与 SVR、LightGBM、Lasso、PLS 四种回归对比。36 页。'
  },
  {
    title: '2026 国赛', sub: '微网购电策略',
    href: 'media/modeling/26-guosai.pdf',
    desc: '微网一天 144 个时段的购电规划：日前时序预测加日内滚动随机优化，在光伏波动和五倍紧急电价下压低总成本。27 页。'
  },
  {
    title: '2026 校赛', sub: '电池快充与寿命',
    href: 'media/modeling/26-guosai-school.pdf',
    desc: '锂电池快充策略与循环寿命：72 种策略的衰减归因，用前 100 圈数据预测寿命，最后做充电时间与寿命的权衡。32 页。'
  },
  {
    title: '2026 美赛 D', sub: 'WNBA 球队经营',
    href: 'media/modeling/26-meisai.pdf',
    desc: '以 WNBA 印第安纳狂热队为例，用内—外环决策框架把竞技表现和商业收益放进同一套优化，回答「该花多少钱、花在哪」。30 页。'
  },
  {
    title: '2026 校赛 A', sub: '污染物跨尺度输运',
    href: 'media/modeling/26-meisai-school.pdf',
    desc: '城市污染物跨尺度输运：分段耦合高斯烟羽加对流扩散，算出室外浓度如何传到室内分布。30 页。'
  }
];

function plankTexture(THREE) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#8a6a48'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 8; i++) {
    g.fillStyle = i % 2 ? 'rgba(0,0,0,.10)' : 'rgba(255,255,255,.05)';
    g.fillRect(0, i * 64, 512, 62);
    g.fillStyle = 'rgba(0,0,0,.18)';
    g.fillRect(0, i * 64 + 62, 512, 2);
  }
  const rand = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  for (let i = 0; i < 900; i++) {
    g.fillStyle = 'rgba(60,40,20,' + (rand() * 0.06).toFixed(3) + ')';
    g.fillRect(rand() * 512, rand() * 512, 20 + rand() * 60, 1);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 2);
  return t;
}

function bookTexture(THREE, title, color) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 340;
  const g = c.getContext('2d');
  g.fillStyle = color; g.fillRect(0, 0, 256, 340);
  g.fillStyle = 'rgba(0,0,0,.18)';
  g.fillRect(0, 0, 18, 340);
  g.strokeStyle = 'rgba(255,255,255,.5)';
  g.lineWidth = 2;
  g.strokeRect(30, 26, 196, 288);
  g.fillStyle = 'rgba(255,255,255,.95)';
  g.font = 'bold 34px "Songti SC", "Noto Serif CJK SC", serif';
  const chars = String(title).split('');
  const per = 6;
  chars.forEach((ch, i) => {
    const row = Math.floor(i / per);
    g.fillText(ch, 62 + row * 62, 96 + (i % per) * 42);
  });
  g.font = '16px "SFMono-Regular", monospace';
  g.fillStyle = 'rgba(255,255,255,.6)';
  g.fillText('CET', 34, 310);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function paperTexture(THREE, title, sub) {
  const c = document.createElement('canvas');
  c.width = 384; c.height = 470;
  const g = c.getContext('2d');
  g.fillStyle = '#f6efe2'; g.fillRect(0, 0, 384, 470);
  g.fillStyle = '#2a241c';
  g.font = 'bold 30px "Songti SC", serif';
  g.fillText(title, 28, 70);
  g.fillStyle = '#6b6152';
  g.font = '20px "Songti SC", serif';
  g.fillText(sub, 28, 110);
  g.fillStyle = 'rgba(90,80,65,.35)';
  for (let i = 0; i < 14; i++) {
    const w = 200 + (i % 5) * 26;
    g.fillRect(28, 150 + i * 20, Math.min(w, 328), 6);
  }
  g.strokeStyle = 'rgba(120,100,70,.35)';
  g.strokeRect(10, 10, 364, 450);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createRoom(THREE, id) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#120f0c');
  scene.fog = new THREE.Fog('#120f0c', 28, 46);

  const hotspots = [];
  const anchors = [];
  const updateFns = [];

  /* ---------- 房间外壳 ---------- */
  const floorMat = new THREE.MeshStandardMaterial({ map: plankTexture(THREE), roughness: 0.72, metalness: 0.02 });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(22, 0.24, 15), floorMat);
  floor.position.y = -0.12;
  floor.receiveShadow = true;
  scene.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xe9dcc4, roughness: 0.95 });
  function wall(w, h, d, x, y, z) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    m.position.set(x, y, z);
    m.receiveShadow = true;
    scene.add(m);
    return m;
  }
  wall(22, 7, 0.3, 0, 3.5, -7.5);
  wall(0.3, 7, 15, -11, 3.5, 0);
  wall(0.3, 7, 15, 11, 3.5, 0);



  /* 天花板 + 顶部灯槽 */
  /* 不封顶：顶部留暗，像挑高的展厅 */

  const coveMat = new THREE.MeshStandardMaterial({
    color: 0x1a1510, emissive: new THREE.Color('#ffcf94'), emissiveIntensity: 1.1, roughness: 0.6
  });
  [[-9.6, 0], [9.6, 0]].forEach(([x]) => {
    const cove = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 13.4), coveMat);
    cove.position.set(x, 6.72, 0);
    scene.add(cove);
  });
  [[0, -6.4]].forEach(([, z]) => {
    const cove = new THREE.Mesh(new THREE.BoxGeometry(20, 0.16, 0.16), coveMat);
    cove.position.set(0, 6.72, z);
    scene.add(cove);
  });

  /* 地板踢脚线 */
  const skirtMat = new THREE.MeshStandardMaterial({ color: 0x6d543a, roughness: 0.85 });
  const skirtBack = new THREE.Mesh(new THREE.BoxGeometry(22, 0.3, 0.12), skirtMat);
  skirtBack.position.set(0, 0.15, -7.32);
  scene.add(skirtBack);
  [-10.86, 10.86].forEach((x) => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.3, 15), skirtMat);
    s.position.set(x, 0.15, 0);
    scene.add(s);
  });

  /* 地毯 */
  const rug = new THREE.Mesh(new THREE.CircleGeometry(4.4, 40), new THREE.MeshStandardMaterial({ color: 0x8d5f45, roughness: 1 }));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.02, 1.5);
  scene.add(rug);

  /* 窗（左墙）—— 傍晚的暖光 */
  const winMat = new THREE.MeshStandardMaterial({
    color: 0x223040, emissive: new THREE.Color('#f0b070'), emissiveIntensity: 1.1, roughness: 0.3
  });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(7, 3.4), winMat);
  win.position.set(-10.82, 3.6, 0.5);
  win.rotation.y = Math.PI / 2;
  scene.add(win);
  const winFrame = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.8, 7.4), new THREE.MeshStandardMaterial({ color: 0x5c4a36, roughness: 0.8 }));
  winFrame.position.set(-10.88, 3.6, 0.5);
  scene.add(winFrame);

  /* ---------- 墙面：门与挂画 ---------- */
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x5b4430, roughness: 0.8 });
  const door = new THREE.Mesh(new THREE.BoxGeometry(2.3, 3.5, 0.18), doorMat);
  door.position.set(-9.25, 1.75, -7.34);
  scene.add(door);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0xc9a872, metalness: 0.8, roughness: 0.3 }));
  knob.position.set(-8.35, 1.7, -7.2);
  scene.add(knob);
  const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.8, 0.1), new THREE.MeshStandardMaterial({ color: 0x3d2e20, roughness: 0.8 }));
  doorFrame.position.set(-9.25, 1.9, -7.4);
  scene.add(doorFrame);

  const artMat = [
    new THREE.MeshStandardMaterial({ color: 0x7c8b74, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0x9a7f68, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0x6f7f92, roughness: 0.9 })
  ];
  [[-10.83, 4.4, -3.2, 0.08], [10.83, 4.6, 2.4, -0.08]].forEach(([x, y, z, ry], i) => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.0, 3.0), new THREE.MeshStandardMaterial({ color: 0x3a2c1f, roughness: 0.8 }));
    frame.position.set(x, y, z);
    scene.add(frame);
    const canvas = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.7), artMat[i % 3]);
    canvas.position.set(x + ry, y, z);
    canvas.rotation.y = Math.PI / 2;
    scene.add(canvas);
  });

  /* 挂钟 */
  const clockBody = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.1, 24), new THREE.MeshStandardMaterial({ color: 0x2b221a, roughness: 0.7 }));
  clockBody.rotation.x = Math.PI / 2;
  clockBody.position.set(8.7, 5.55, -7.3);
  scene.add(clockBody);
  const clockFace = new THREE.Mesh(new THREE.CircleGeometry(0.54, 24), new THREE.MeshStandardMaterial({ color: 0xf6eddc, roughness: 0.6 }));
  clockFace.position.set(8.7, 5.55, -7.24);
  scene.add(clockFace);

  /* 顶部灯带 */
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0x1a1510, emissive: new THREE.Color('#ffd9a8'), emissiveIntensity: 2.4, roughness: 0.4
  });
  const cordMat = new THREE.MeshStandardMaterial({ color: 0x2a221a, roughness: 1 });
  [-4.4, 0, 4.4].forEach((x) => {
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.1, 5), cordMat);
    cord.position.set(x, 6.35, 1.2);
    scene.add(cord);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), bulbMat);
    bulb.position.set(x, 5.75, 1.2);
    scene.add(bulb);
    const glow = new THREE.PointLight(0xffd9a8, 9, 12, 2);
    glow.position.set(x, 5.6, 1.2);
    scene.add(glow);
  });

  /* ---------- 灯光 ---------- */
  const keyLight = new THREE.DirectionalLight(0xfff0d8, 1.6);
  keyLight.position.set(6, 9, 7);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 40;
  keyLight.shadow.camera.left = -14;
  keyLight.shadow.camera.right = 14;
  keyLight.shadow.camera.top = 14;
  keyLight.shadow.camera.bottom = -14;
  scene.add(keyLight);

  scene.add(new THREE.AmbientLight(0xffe6c8, 0.85));
  scene.add(new THREE.HemisphereLight(0xffe7c9, 0x4a3a2a, 0.65));

  const lampMat = new THREE.MeshStandardMaterial({ color: 0x2a221a, emissive: new THREE.Color('#ffd9a0'), emissiveIntensity: 1.6, roughness: 0.5 });
  [[-4.5, 1.5], [4.5, 1.5]].forEach(([x, z]) => {
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 12), new THREE.MeshStandardMaterial({
      color: 0x2a221a, emissive: new THREE.Color('#ffe0b0'), emissiveIntensity: 2.6, roughness: 0.35
    }));
    bulb.position.set(x, 5.05, z);
    scene.add(bulb);
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1.9, 6), new THREE.MeshStandardMaterial({ color: 0x2a221a }));
    wire.position.set(x, 6.1, z);
    scene.add(wire);
    const pl = new THREE.PointLight(0xffd9a8, 26, 22, 2);
    pl.position.set(x, 4.9, z);
    scene.add(pl);
  });

  /* ---------- 内容 ---------- */
  if (id === 'course') {
    const pedestalMat = new THREE.MeshStandardMaterial({ color: 0xcbb99a, roughness: 0.85 });
    const bookGeo = new THREE.BoxGeometry(1.15, 1.55, 0.26);

    COURSES.forEach((c, i) => {
      const single = COURSES.length === 1;
      const col = i % 3, row = Math.floor(i / 3);
      const x = single ? 0 : -6 + col * 6;
      const z = single ? -2.8 : -5.2 + row * 3.6;

      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.62, 1.1, 18), pedestalMat);
      ped.position.set(x, 0.55, z);
      ped.castShadow = true;
      scene.add(ped);

      const bookMat = new THREE.MeshStandardMaterial({ map: bookTexture(THREE, c.title, c.color), roughness: 0.62 });
      const book = new THREE.Mesh(bookGeo, bookMat);
      book.position.set(x, 1.92, z);
      book.rotation.y = -0.28 + i * 0.06;
      book.rotation.z = 0.04;
      book.castShadow = true;
      scene.add(book);

      const band = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.09, 0.29),
        new THREE.MeshStandardMaterial({ color: 0xf3e8d2, emissive: new THREE.Color('#ffd9a0'), emissiveIntensity: 0.55, roughness: 0.6 }));
      band.position.set(x, 1.62, z);
      band.rotation.y = book.rotation.y;
      scene.add(band);

      const item = { kind: 'course', title: c.title, note: c.note, href: 'work/?m=course' };
      book.userData.item = item;
      band.userData.item = item;
      hotspots.push(book, band);
      anchors.push({ pos: new THREE.Vector3(x, 2.95, z), title: c.title, small: true });
    });

    /* 墙上挂牌 */
    const signMat = new THREE.MeshStandardMaterial({ color: 0x3f3226, roughness: 0.7 });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(9, 1.1, 0.12), signMat);
    sign.position.set(0, 5.9, -7.28);
    scene.add(sign);

    /* 角落绿植 */
    const potMat = new THREE.MeshStandardMaterial({ color: 0x8d5a3c, roughness: 0.9 });
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.42, 0.9, 14), potMat);
    pot.position.set(-9.2, 0.45, -6.2);
    scene.add(pot);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x4f6b46, roughness: 1 });
    for (let i = 0; i < 5; i++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.9, 6), leafMat);
      leaf.position.set(-9.2 + (i - 2) * 0.22, 1.7, -6.2 + (i % 2) * 0.18);
      leaf.rotation.z = (i - 2) * 0.14;
      scene.add(leaf);
    }

    /* ---------- 书桌、台灯、椅子、书架 ---------- */
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8a6746, roughness: 0.8 });
    const woodDark = new THREE.MeshStandardMaterial({ color: 0x6a4f36, roughness: 0.85 });
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xf4ecdc, roughness: 0.95 });
    const metalMat2 = new THREE.MeshStandardMaterial({ color: 0x9aa3a8, metalness: 0.75, roughness: 0.35 });

    const DK = -4.3, DZ = 0.4;

    /* 桌子 */
    const deskMesh = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.14, 1.8), woodMat);
    deskMesh.position.set(DK, 1.0, DZ);
    deskMesh.castShadow = true;
    deskMesh.receiveShadow = true;
    scene.add(deskMesh);
    [[-1.75, -0.7], [1.75, -0.7], [-1.75, 0.7], [1.75, 0.7]].forEach(([dx, dz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.0, 0.14), woodDark);
      leg.position.set(DK + dx, 0.5, DZ + dz);
      leg.castShadow = true;
      scene.add(leg);
    });

    /* 摊开的书 */
    [[-0.5, 0.16], [0.5, -0.16]].forEach(([dx, rz]) => {
      const page = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.035, 1.2), paperMat);
      page.position.set(DK + dx, 1.09, DZ + 0.15);
      page.rotation.z = rz;
      page.castShadow = true;
      scene.add(page);
    });

    /* 台灯 */
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.07, 18), metalMat2);
    base.position.set(DK - 1.35, 1.11, DZ - 0.3);
    scene.add(base);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.95, 8), metalMat2);
    stem.position.set(DK - 1.35, 1.6, DZ - 0.3);
    scene.add(stem);
    const shadeMat2 = new THREE.MeshStandardMaterial({
      color: 0x2a221a, emissive: new THREE.Color('#ffd9a0'), emissiveIntensity: 1.9,
      roughness: 0.5, side: THREE.DoubleSide
    });
    const shade2 = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.36, 0.34, 20, 1, true), shadeMat2);
    shade2.position.set(DK - 1.35, 2.1, DZ - 0.3);
    scene.add(shade2);
    const lampGlow = new THREE.PointLight(0xffd9a0, 9, 7, 2);
    lampGlow.position.set(DK - 1.35, 1.95, DZ - 0.3);
    scene.add(lampGlow);

    /* 椅子 */
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.12, 1.15), woodMat);
    seat.position.set(DK, 0.56, DZ + 2.0);
    seat.castShadow = true;
    scene.add(seat);
    [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]].forEach(([dx, dz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.56, 0.11), woodDark);
      leg.position.set(DK + dx, 0.28, DZ + 2.0 + dz);
      leg.castShadow = true;
      scene.add(leg);
    });
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.9, 0.1), woodMat);
    back.position.set(DK, 1.05, DZ + 2.53);
    back.castShadow = true;
    scene.add(back);

    /* 靠后墙的书架 */
    const SX = 6.6, SZ = -7.15;
    const shelfFrame = new THREE.Mesh(new THREE.BoxGeometry(2.7, 2.7, 0.44), woodDark);
    shelfFrame.position.set(SX, 1.35, SZ);
    shelfFrame.castShadow = true;
    scene.add(shelfFrame);
    for (let i = 0; i < 4; i++) {
      const board = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.07, 0.4), woodMat);
      board.position.set(SX, 0.36 + i * 0.64, SZ + 0.04);
      scene.add(board);
    }
    const spineColors = ['#7f9c8a', '#a8785c', '#6f88a8', '#9a7fa0', '#a8975c', '#7f8f9c'];
    for (let row = 0; row < 3; row++) {
      for (let b = 0; b < 6; b++) {
        const spine = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.46 + (b % 3) * 0.06, 0.26),
          new THREE.MeshStandardMaterial({ color: new THREE.Color(spineColors[(row + b) % 6]), roughness: 0.85 })
        );
        spine.position.set(SX - 0.92 + b * 0.37, 0.66 + row * 0.64, SZ + 0.13);
        spine.castShadow = true;
        scene.add(spine);
      }
    }
  } else {
    /* 数学建模：六篇论文挂墙上 */
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x4a3a28, roughness: 0.75 });
    PAPERS.forEach((p, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const x = -5.8 + col * 5.8;
      const y = row === 0 ? 4.62 : 1.12;
      const w = 2.85, h = 2.95;

      const paperMat = new THREE.MeshStandardMaterial({ map: paperTexture(THREE, p.title, p.sub), roughness: 0.9 });
      const sheet = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.1), paperMat);
      sheet.position.set(x, y, -7.3);
      scene.add(sheet);

      const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.28, h + 0.28, 0.08), frameMat);
      frame.position.set(x, y, -7.36);
      scene.add(frame);

      const item = {
        kind: 'paper', tag: p.title, title: p.sub, desc: p.desc,
        href: p.href, hrefText: '打开论文 PDF'
      };
      sheet.userData.item = item;
      hotspots.push(sheet);
      anchors.push({ pos: new THREE.Vector3(x, y - h / 2 - 0.38, -7.0), title: p.sub, small: true });
    });

    /* 中间一张长桌 */
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x8a6746, roughness: 0.8 });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.16, 2.2), deskMat);
    desk.position.set(0, 1.02, 0.4);
    scene.add(desk);
    [[-2.3, -0.7], [2.3, -0.7], [-2.3, 1.5], [2.3, 1.5]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.0, 0.14), deskMat);
      leg.position.set(x, 0.5, z);
      scene.add(leg);
    });
    /* 桌上的稿纸 */
    const sheetMat = new THREE.MeshStandardMaterial({ color: 0xf4ecdc, roughness: 0.95 });
    [
      [-1.55, 0.34, 0.06, -0.10],
      [0.05, 0.52, 0.18, 0.16],
      [1.5, 0.30, 0.42, -0.22]
    ].forEach(([x, z, dy, ry]) => {
      const sheet = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.012, 1.4), sheetMat);
      sheet.position.set(x, 1.11 + dy, z);
      sheet.rotation.y = ry;
      sheet.castShadow = false;
      scene.add(sheet);
    });
  }

  /* 浮尘，让房间有空气感 */
  const dustGeo = new THREE.BufferGeometry();
  const pos = [];
  for (let i = 0; i < 120; i++) {
    pos.push((Math.random() - 0.5) * 18, Math.random() * 6, (Math.random() - 0.5) * 12);
  }
  dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xffe6bf, size: 0.06, transparent: true, opacity: 0.5, depthWrite: false
  }));
  scene.add(dust);
  let t0 = 0;

  return {
    scene,
    hotspots,
    anchors,
    update(dt) {
      t0 += dt;
      dust.rotation.y = t0 * 0.02;
      dust.position.y = Math.sin(t0 * 0.3) * 0.08;
      updateFns.forEach((f) => f(dt));
    }
  };
}
