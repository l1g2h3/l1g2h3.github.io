/* =========================================================
   室内场景 — 从城市点进建筑之后的第二层
   createRoom(THREE, id) → { scene, hotspots, anchors, update }
   hotspots 里的 mesh 带 userData.item，供射线拾取。
   ========================================================= */

const COURSES = [
  { title: '信号与系统', note: '专业基础', color: '#7f9c8a' },
  { title: '医学影像处理', note: '专业课', color: '#a8785c' },
  { title: '自动控制原理', note: '专业基础', color: '#6f88a8' },
  { title: '机器学习', note: '选修', color: '#9a7fa0' },
  { title: '生物医学工程导论', note: '导论', color: '#a8975c' },
  { title: '电路分析', note: '专业基础', color: '#7f8f9c' }
];

const PAPERS = [
  { title: '2025 国赛', sub: 'NIPT 时点选择', href: 'media/modeling/25-guosai.pdf' },
  { title: '2025 校赛 A', sub: '输尿管流量—压降', href: 'media/modeling/25-guosai-school-a.pdf' },
  { title: '2026 国赛', sub: '微网购电策略', href: 'media/modeling/26-guosai.pdf' },
  { title: '2026 校赛', sub: '电池快充与寿命', href: 'media/modeling/26-guosai-school.pdf' },
  { title: '2026 美赛 D', sub: 'WNBA 球队经营', href: 'media/modeling/26-meisai.pdf' },
  { title: '2026 校赛 A', sub: '污染物跨尺度输运', href: 'media/modeling/26-meisai-school.pdf' }
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

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xded0b8, roughness: 0.95 });
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

  scene.add(new THREE.AmbientLight(0xffe6c8, 0.55));
  scene.add(new THREE.HemisphereLight(0xffe7c9, 0x4a3a2a, 0.5));

  const lampMat = new THREE.MeshStandardMaterial({ color: 0x2a221a, emissive: new THREE.Color('#ffd9a0'), emissiveIntensity: 1.6, roughness: 0.5 });
  [[-4.5, 1.5], [4.5, 1.5]].forEach(([x, z]) => {
    const shade = new THREE.Mesh(new THREE.ConeGeometry(1.1, 0.7, 16, 1, true), lampMat);
    shade.position.set(x, 5.4, z);
    shade.rotation.x = Math.PI;
    scene.add(shade);
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 6), new THREE.MeshStandardMaterial({ color: 0x2a221a }));
    wire.position.set(x, 6.4, z);
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
      const col = i % 3, row = Math.floor(i / 3);
      const x = -6 + col * 6;
      const z = -4 + row * 5;

      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.62, 1.1, 18), pedestalMat);
      ped.position.set(x, 0.55, z);
      ped.castShadow = true;
      scene.add(ped);

      const bookMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(c.color), roughness: 0.62 });
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
  } else {
    /* 数学建模：六篇论文挂墙上 */
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x4a3a28, roughness: 0.75 });
    PAPERS.forEach((p, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const x = -6.2 + col * 6.2;
      const y = row === 0 ? 4.35 : 1.75;
      const w = 2.9, h = 3.3;

      const paperMat = new THREE.MeshStandardMaterial({ map: paperTexture(THREE, p.title, p.sub), roughness: 0.9 });
      const sheet = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.1), paperMat);
      sheet.position.set(x, y, -7.3);
      scene.add(sheet);

      const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.28, h + 0.28, 0.08), frameMat);
      frame.position.set(x, y, -7.36);
      scene.add(frame);

      const item = { kind: 'paper', title: p.title + ' · ' + p.sub, note: '点开看论文原文件', href: p.href };
      sheet.userData.item = item;
      hotspots.push(sheet);
      anchors.push({ pos: new THREE.Vector3(x, y - h / 2 - 0.45, -7.0), title: p.sub, small: true });
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
    for (let i = 0; i < 4; i++) {
      const sheet = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.02, 1.5),
        new THREE.MeshStandardMaterial({ color: 0xf4ecdc, roughness: 0.95 }));
      sheet.position.set(-1.2 + i * 0.9, 1.12, 0.5 + (i % 2) * 0.25);
      sheet.rotation.y = (i - 1.5) * 0.12;
      scene.add(sheet);
    }
    /* 白板 */
    const board = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.6, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xf7f4ec, roughness: 0.5 }));
    board.position.set(0, 3.4, -7.26);
    scene.add(board);
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
