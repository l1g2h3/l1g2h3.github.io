/* 学习笔记 — 用 ?id=<slug> 打开单篇，无参数显示索引 */

(function () {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? '' : s)
    .replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* 行内格式：**粗体**、`代码` */
  function inline(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  const PREF_KEY = 'cet6.prefs.v1';
  function applyTheme() {
    let theme = 'auto';
    try { theme = (JSON.parse(localStorage.getItem(PREF_KEY) || '{}') || {}).theme || 'auto'; } catch (e) { /* ignore */ }
    const dark = theme === 'dark' || (theme === 'auto' && window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }

  function anchorOf(s, i) {
    return 'sec-' + i;
  }

  function renderIndex() {
    document.title = '学习笔记 · LGH';
    const toc = document.getElementById('toc');
    if (toc) toc.style.display = 'none';
    const layout = document.querySelector('.layout');
    if (layout) layout.classList.add('single');
    const items = NOTES.map((n) =>
      '<a class="item" href="?id=' + esc(n.id) + '">' +
      '<h2>' + esc(n.title) + '</h2>' +
      '<p>' + esc(n.lead) + '</p>' +
      '<div class="meta">' + n.tags.map((t) => '<span class="tag">' + esc(t) + '</span>').join('') +
      '<span>' + esc(n.date) + '</span>' +
      '<span>' + n.sections.length + ' 节</span></div></a>'
    ).join('');

    $('#main').innerHTML =
      '<div class="head"><p class="eyebrow">NOTES</p>' +
      '<h1>学习笔记</h1>' +
      '<p class="lead">把学过的东西写下来，才算真的学过。这里是一些整理过的笔记，主题集中在生成模型、强化学习和注意力机制。</p></div>' +
      '<div class="list">' + items + '</div>';
  }

  function renderNote(note) {
    document.title = note.title + ' · LGH';
    const layoutEl = document.querySelector('.layout');
    if (layoutEl) layoutEl.classList.remove('single');
    const idx = NOTES.indexOf(note);
    const prev = NOTES[idx - 1];
    const next = NOTES[idx + 1];

    const body = note.sections.map((sec, i) => {
      let html = '<section id="' + anchorOf(sec, i) + '"><h2>' + esc(sec.h) + '</h2>';
      (sec.p || []).forEach((t) => { html += '<p>' + inline(t) + '</p>'; });
      if (sec.formula) html += '<div class="formula">' + esc(sec.formula) + '</div>';
      if (sec.code) html += '<pre>' + esc(sec.code) + '</pre>';
      if (sec.list) {
        html += '<ul>' + sec.list.map((li) => '<li>' + inline(li) + '</li>').join('') + '</ul>';
      }
      if (sec.table) {
        html += '<table><thead><tr>' +
          sec.table.head.map((h) => '<th>' + esc(h) + '</th>').join('') +
          '</tr></thead><tbody>' +
          sec.table.rows.map((row) => '<tr>' + row.map((c) => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') +
          '</tbody></table>';
      }
      if (sec.callout) html += '<div class="callout">' + inline(sec.callout) + '</div>';
      return html + '</section>';
    }).join('');

    const toc = '<div class="toc-title">目录</div>' +
      note.sections.map((s, i) => '<a href="#' + anchorOf(s, i) + '">' + esc(s.h) + '</a>').join('');

    const pager = '<nav class="pager">' +
      (prev ? '<a href="?id=' + esc(prev.id) + '"><span class="k">上一篇</span>' + esc(prev.title) + '</a>' : '<span></span>') +
      (next ? '<a class="right" href="?id=' + esc(next.id) + '"><span class="k">下一篇</span>' + esc(next.title) + '</a>' : '') +
      '</nav>';

    $('#main').innerHTML =
      '<div class="head">' +
      '<a href="./" style="font-family:var(--mono);font-size:11px;color:var(--ink-3);letter-spacing:.1em">← 全部笔记</a>' +
      '<p class="eyebrow" style="margin-top:14px">' + note.tags.map(esc).join(' · ') + '</p>' +
      '<h1>' + esc(note.title) + '</h1>' +
      '<p class="lead">' + esc(note.lead) + '</p>' +
      '<div class="meta"><span>' + esc(note.date) + '</span><span>' + note.sections.length + ' 节</span></div>' +
      '</div>' + body + pager;

    const tocBox = document.getElementById('toc');
    if (tocBox) tocBox.innerHTML = toc;

    /* 目录高亮 */
    const links = Array.from(document.querySelectorAll('.toc a'));
    const secs = Array.from(document.querySelectorAll('section'));
    if ('IntersectionObserver' in window && secs.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          links.forEach((a) => { a.style.color = ''; a.style.borderLeftColor = ''; });
          const a = links.find((x) => x.getAttribute('href') === '#' + e.target.id);
          if (a) { a.style.color = 'var(--ink)'; a.style.borderLeftColor = 'var(--accent)'; }
        });
      }, { rootMargin: '-80px 0px -70% 0px' });
      secs.forEach((s) => io.observe(s));
    }
  }

  applyTheme();
  if (typeof NOTES === 'undefined') {
    $('#main').innerHTML = '<p style="padding:40px">笔记数据没加载。</p>';
    return;
  }
  const id = new URLSearchParams(location.search).get('id');
  const note = id ? NOTES.filter((n) => n.id === id)[0] : null;
  if (note) renderNote(note);
  else renderIndex();
})();
