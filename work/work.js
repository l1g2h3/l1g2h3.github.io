/* 项目内容页 — 用 ?m=<id> 切换模块
   新增模块只要在 work-data.js 里加一条，页面不用改。 */

(function () {
  'use strict';

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const $ = (s) => document.querySelector(s);
  const params = new URLSearchParams(location.search);
  const id = params.get('m');
  const main = $('#main');

  /* 主题跟主页共用 */
  const PREF_KEY = 'cet6.prefs.v1';
  function applyTheme() {
    let theme = 'auto';
    try { theme = (JSON.parse(localStorage.getItem(PREF_KEY) || '{}') || {}).theme || 'auto'; } catch (e) { /* ignore */ }
    const dark = theme === 'dark' || (theme === 'auto' && window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }

  /* 页面在 /work/ 下，素材放在站点根目录的 media/，统一补一层 ../ */
  function asset(src) {
    return /^(https?:|data:|\.\.\/|\/)/.test(src) ? src : '../' + src;
  }

  function sizeText(n) {
    if (!n) return '';
    return n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.round(n / 1024) + ' KB';
  }

  function renderIndex() {
    const cards = Object.keys(WORK).map((k) => {
      const m = WORK[k];
      const n = (m.items || []).length;
      return '<a class="card" href="?m=' + esc(k) + '">' +
        '<div class="card-top"><h2>' + esc(m.title) + '</h2>' +
        '<span class="tag ' + (n ? '' : 'soon') + '">' + esc(m.tag) + '</span></div>' +
        '<p>' + esc(m.lead) + '</p>' +
        '<div class="foot">' + (n ? n + ' 项材料' : '整理中') + '</div></a>';
    }).join('');
    document.title = '项目 · LGH';
    main.innerHTML =
      '<div class="head"><p class="eyebrow">WORK</p><h1>项目</h1>' +
      '<p class="sub">每个模块都是一栋楼。这里放它们的内容：论文、证书、照片和视频。</p></div>' +
      '<div class="grid">' + cards + '</div>' +
      '<p class="back"><a href="../">← 回到城市</a></p>';
  }

  function renderModule(key) {
    const m = WORK[key];
    if (!m) { renderIndex(); return; }
    document.title = m.title + ' · LGH';

    const items = m.items || [];
    const images = items.filter((i) => i.type === 'image');
    const videos = items.filter((i) => i.type === 'video');
    const files = items.filter((i) => i.type === 'file');

    const gallery = images.length
      ? '<section class="block"><h2>照片</h2><div class="gallery">' + images.map((it, i) =>
          '<button class="shot" data-i="' + i + '" type="button">' +
          '<img src="' + esc(asset(it.src)) + '" alt="' + esc(it.title || '') + '" loading="lazy">' +
          (it.note ? '<span>' + esc(it.note) + '</span>' : '') + '</button>').join('') + '</div></section>'
      : '';

    const videoBlock = videos.length
      ? '<section class="block"><h2>视频</h2><div class="videos">' + videos.map((it) =>
          '<figure><video controls preload="none" playsinline src="' + esc(asset(it.src)) + '"' +
          (it.poster ? ' poster="' + esc(asset(it.poster)) + '"' : '') + '></video>' +
          '<figcaption>' + esc(it.title) + '</figcaption></figure>').join('') + '</div></section>'
      : '';

    const fileBlock = files.length
      ? '<section class="block"><h2>文件</h2><ul class="files">' + files.map((it) =>
          '<li><a href="' + esc(asset(it.src)) + '" target="_blank" rel="noopener">' +
          '<span class="fname">' + esc(it.title) + '</span>' +
          '<span class="fmeta">' + esc(it.note || 'PDF') + (it.size ? ' · ' + sizeText(it.size) : '') + '</span></a></li>').join('') + '</ul></section>'
      : '';

    const empty = !items.length
      ? '<p class="empty">材料还在整理，先把位置占着。想看什么可以直接问我。</p>' : '';

    const keys = Object.keys(WORK);
    const idx = keys.indexOf(key);
    const prev = keys[(idx - 1 + keys.length) % keys.length];
    const next = keys[(idx + 1) % keys.length];
    const nav = '<nav class="pager">' +
      '<a href="?m=' + esc(prev) + '">← ' + esc(WORK[prev].title) + '</a>' +
      '<a href="?m=' + esc(next) + '">' + esc(WORK[next].title) + ' →</a></nav>';

    main.innerHTML =
      '<div class="head">' +
      '<a class="up" href="./">← 全部项目</a>' +
      '<p class="eyebrow">' + esc(m.tag) + (m.year ? ' · ' + esc(m.year) : '') + '</p>' +
      '<h1>' + esc(m.title) + '</h1>' +
      '<p class="sub">' + esc(m.lead) + '</p>' +
      (m.meta && m.meta.length ? '<dl class="meta">' + m.meta.map((x) =>
        '<div><dt>' + esc(x[0]) + '</dt><dd>' + esc(x[1]) + '</dd></div>').join('') + '</dl>' : '') +
      '</div>' +
      (m.body && m.body.length ? '<section class="block prose">' + m.body.map((p) => '<p>' + esc(p) + '</p>').join('') + '</section>' : '') +
      gallery + videoBlock + fileBlock + empty + nav +
      '<p class="back"><a href="../">← 回到城市</a></p>';

    /* 灯箱 */
    if (images.length) {
      const box = document.createElement('div');
      box.className = 'lightbox';
      box.hidden = true;
      box.innerHTML = '<button class="close" aria-label="关闭">×</button><img alt=""><p></p>';
      document.body.appendChild(box);
      const img = box.querySelector('img');
      const cap = box.querySelector('p');
      box.addEventListener('click', (e) => {
        if (e.target === box || e.target.classList.contains('close')) box.hidden = true;
      });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') box.hidden = true; });
      main.addEventListener('click', (e) => {
        const b = e.target.closest('.shot');
        if (!b) return;
        const it = images[Number(b.dataset.i)];
        img.src = asset(it.src);
        cap.textContent = it.note || it.title || '';
        box.hidden = false;
      });
    }
  }

  applyTheme();
  if (typeof WORK === 'undefined') {
    main.innerHTML = '<p style="padding:40px">数据没加载成功。</p>';
    return;
  }
  if (id) renderModule(id);
  else renderIndex();
})();
