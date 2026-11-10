/* =========================================================
   英语阅读本 — 交互逻辑
   ========================================================= */
(function () {
  'use strict';

  /* ---------------- 存储 ---------------- */
  const KEY = { prefs: 'cet6.prefs.v1', flags: 'cet6.flags.v1', extra: 'cet6.extra.v1', notebook: 'cet6.notebook.v1' };
  const LS = {
    get(k, fb) {
      try { const r = localStorage.getItem(k); return r == null ? fb : JSON.parse(r); }
      catch (e) { return fb; }
    },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 无痕模式忽略 */ } }
  };

  let prefs = Object.assign({ mode: 'bi', hl: true, size: 19, theme: 'auto', selPop: true }, LS.get(KEY.prefs, {}));
  let flags = LS.get(KEY.flags, {});      // { lemma: 'known' | 'new' }
  let extra = LS.get(KEY.extra, []);      // 导入的额外批次
  let notebook = LS.get(KEY.notebook, []); // 生词本

  const savePrefs = () => LS.set(KEY.prefs, prefs);
  const saveFlags = () => LS.set(KEY.flags, flags);
  const saveExtra = () => LS.set(KEY.extra, extra);
  const saveNotebook = () => LS.set(KEY.notebook, notebook);

  /* 云同步：把内存状态交给 sync.js，并接受合并后的结果 */
  function syncGetState() { return { flags: flags, notebook: notebook, extra: extra }; }
  function syncApplyState(s) {
    if (!s || !window.CET6Sync) return;
    window.CET6Sync.suppressWhile(function () {
      if (s.flags && typeof s.flags === 'object') { flags = s.flags; saveFlags(); }
      if (Array.isArray(s.notebook)) { notebook = s.notebook; saveNotebook(); }
      if (Array.isArray(s.extra)) { extra = s.extra; saveExtra(); }
    });
    render();
  }

  /* ---------------- 小工具 ---------------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const app = $('#app');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const stripMarks = (s) => String(s).replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (m, a) => a);
  const zhHTML = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { t.classList.remove('show'); setTimeout(() => { t.hidden = true; }, 220); }, 1800);
  }

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------------- 数据访问 ---------------- */
  const batches = () => ((window.VOCAB && window.VOCAB.batches) ? window.VOCAB.batches : []).concat(extra.filter((b) => b && b.id && b.words));
  const batchById = (id) => batches().filter((b) => b.id === id)[0];

  function allWords() {
    const out = [];
    batches().forEach((b) => (b.words || []).forEach((w) => {
      out.push(Object.assign({}, w, { batchId: b.id, batchTitle: b.title, batchTitleZh: b.titleZh }));
    }));
    return out;
  }
  const wordByLemma = (lemma) => allWords().filter((w) => w.lemma === lemma)[0];

  /* 领域 */
  const fields = () => ((window.VOCAB && window.VOCAB.fields) ? window.VOCAB.fields : []);
  const fieldById = (id) => fields().filter((f) => f.id === id)[0];
  const fieldName = (id) => { const f = fieldById(id); return f ? f.name : ''; };
  const lexiconOf = (id) => ((window.VOCAB && window.VOCAB.lexicon && window.VOCAB.lexicon[id]) || []);
  function allLexicon() {
    const out = [];
    fields().forEach((f) => lexiconOf(f.id).forEach((x) => {
      out.push(Object.assign({ field: f.id, fieldName: f.name }, x));
    }));
    return out;
  }

  /* 生词本 */
  const nbHas = (term) => notebook.some((n) => String(n.term).toLowerCase() === String(term).toLowerCase());

  function nbAdd(item) {
    if (!item || !item.term) return false;
    if (nbHas(item.term)) return false;
    notebook.unshift({
      term: String(item.term).trim(),
      zh: item.zh || '',
      ipa: item.ipa || '',
      pos: item.pos || '',
      collocation: item.collocation || '',
      from: item.from || '划词',
      batchId: item.batchId || '',
      addedAt: Date.now()
    });
    saveNotebook();
    return true;
  }

  function nbRemove(term) {
    const before = notebook.length;
    notebook = notebook.filter((n) => String(n.term).toLowerCase() !== String(term).toLowerCase());
    saveNotebook();
    return notebook.length !== before;
  }

  function nbAddWord(lemma) {
    const w = wordByLemma(lemma);
    if (!w) return false;
    const b = batchById(w.batchId);
    return nbAdd({
      term: w.lemma, zh: w.meaning, ipa: w.ipa, pos: w.pos,
      collocation: w.collocation, from: b ? b.title : '词库', batchId: w.batchId
    });
  }

  function exampleFor(batch, lemma) {
    const paras = (batch && batch.paragraphs) || [];
    for (let pi = 0; pi < paras.length; pi++) {
      if (!paras[pi] || !paras[pi].en) continue;
      const raw = paras[pi].en;
      const re = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
      let m, stripped = '', last = 0, hit = null;
      while ((m = re.exec(raw))) {
        stripped += raw.slice(last, m.index);
        const surf = m[1];
        const lem = (m[2] || m[1]).toLowerCase();
        if (!hit && lem === lemma) hit = { at: stripped.length, word: surf };
        stripped += surf;
        last = m.index + m[0].length;
      }
      stripped += raw.slice(last);
      if (!hit) continue;

      const pre = stripped.slice(0, hit.at);
      const b1 = pre.lastIndexOf('. '), b2 = pre.lastIndexOf('; '), b3 = pre.lastIndexOf('? '), b4 = pre.lastIndexOf('! ');
      const cut = Math.max(b1, b2, b3, b4);
      const start = cut < 0 ? 0 : cut + 2;
      const post = stripped.slice(hit.at + hit.word.length);
      const mEnd = post.match(/^[^.!?;]*[.!?;]?/);
      const end = hit.at + hit.word.length + (mEnd ? mEnd[0].length : 0);
      const sent = stripped.slice(start, end).trim();
      let idx = sent.indexOf(hit.word);
      if (idx < 0) idx = sent.toLowerCase().indexOf(hit.word.toLowerCase());
      if (idx < 0) idx = 0;
      return { before: sent.slice(0, idx), word: sent.slice(idx, idx + hit.word.length), after: sent.slice(idx + hit.word.length) };
    }
    return null;
  }

  /* ---------------- 主题 / 字号 ---------------- */
  const mq = window.matchMedia('(prefers-color-scheme: dark)');

  function applyTheme() {
    const t = prefs.theme === 'auto' ? (mq.matches ? 'dark' : 'light') : prefs.theme;
    document.documentElement.dataset.theme = t;
    const btn = $('#themeBtn');
    if (btn) {
      btn.textContent = t === 'dark' ? '☾' : '☀';
      btn.title = '当前：' + ({ auto: '跟随系统', light: '浅色', dark: '深色' }[prefs.theme]);
    }
  }
  mq.addEventListener('change', () => { if (prefs.theme === 'auto') applyTheme(); });

  /* ---------------- 标记渲染 ---------------- */
  function enHTML(text, batchId) {
    return esc(text).replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (m, surface, lemma) => {
      const l = (lemma || surface).toLowerCase();
      return '<mark class="v" data-lemma="' + esc(l) + '" data-surface="' + esc(surface.toLowerCase()) +
        '" data-batch="' + esc(batchId) + '">' + esc(surface) + '</mark>';
    });
  }

  function syncMarks(root) {
    $$('mark.v', root || document).forEach((m) => {
      const f = flags[m.dataset.lemma];
      m.classList.toggle('is-known', f === 'known');
      m.classList.toggle('is-new', f === 'new');
    });
  }

  /* =========================================================
     视图
     ========================================================= */

  let homeField = 'all';

  function renderHome() {
    const bs = batches();
    const ws = allWords();
    const known = ws.filter((w) => flags[w.lemma] === 'known').length;
    const pending = ws.filter((w) => flags[w.lemma] === 'new').length;
    const shown = homeField === 'all' ? bs : bs.filter((b) => b.field === homeField);

    const cards = shown.map((b) => {
      const chips = (b.words || []).slice(0, 8).map((w) => '<span class="chip">' + esc(w.lemma) + '</span>').join('');
      const fn = fieldName(b.field);
      return '' +
        '<a class="batch-card" href="#/b/' + esc(b.id) + '">' +
        '<div class="pills">' +
        (fn ? '<span class="pill">' + esc(fn) + '</span>' : '') +
        (b.genre ? '<span class="pill ghost">' + esc(b.genre) + '</span>' : '') +
        '</div>' +
        '<h3>' + esc(b.title) + '</h3>' +
        '<div class="zh">' + esc(b.titleZh || '') + '</div>' +
        '<div class="chips">' + chips + '</div>' +
        '<div class="card-foot"><span>' + (b.words || []).length + ' 词</span><span>' + esc(b.date || '') + '</span>' +
        '<span class="go">阅读 →</span></div>' +
        '</a>';
    }).join('');

    const fchips = '<button class="filter-chip" data-home-field="all" aria-pressed="' + (homeField === 'all') + '">全部' +
      '<span class="cnt">' + bs.length + '</span></button>' +
      fields().map((f) => {
        const n = bs.filter((b) => b.field === f.id).length;
        return '<button class="filter-chip" data-home-field="' + esc(f.id) + '" aria-pressed="' + (homeField === f.id) + '">' +
          esc(f.name) + '<span class="cnt">' + n + '</span></button>';
      }).join('');

    let listHTML;
    if (shown.length) {
      listHTML = '<div class="batch-grid">' + cards + '</div>';
    } else if (homeField === 'all') {
      listHTML = '<div class="empty"><b>还没有内容</b>在 data.js 里添加第一批词吧。</div>';
    } else {
      const f = fieldById(homeField);
      const n = lexiconOf(homeField).length;
      listHTML = '<div class="empty"><b>「' + esc(f ? f.name : homeField) + '」还没有短文</b>' +
        (n ? '这个领域目前整理了 ' + n + ' 条常用说法，可以先看词汇。' : '这个领域还没有内容。') +
        (n ? '<div class="stack" style="justify-content:center;margin-top:16px">' +
          '<a class="btn" href="#/lexicon/' + esc(homeField) + '">看' + esc(f ? f.name : '') + '领域词汇</a></div>' : '') +
        '</div>';
    }

    app.innerHTML = '' +
      '<section class="hero">' +
      '<div>' +
      '<div class="eyebrow">ENGLISH · 语境记词</div>' +
      '<h1 class="hero-title">读一篇短文，记住<em>一批词</em></h1>' +
      '<p class="hero-sub">每个词都在英语篇章里出现过，读的时候能看见它怎么用，复习的时候能回到那句话。</p>' +
      '</div>' +
      '<div class="stats">' +
      '<div class="stat"><b>' + bs.length + '</b><span>批次</span></div>' +
      '<div class="stat"><b>' + fields().length + '</b><span>领域</span></div>' +
      '<div class="stat"><b>' + ws.length + '</b><span>词条</span></div>' +
      '<div class="stat"><b>' + pending + '</b><span>待复习</span></div>' +
      '</div>' +
      '</section>' +
      '<div class="section-head"><h2>批次</h2><span>按领域筛选，点开阅读</span></div>' +
      '<div class="filters">' + fchips + '</div>' +
      listHTML;
  }

  function renderReading(batchId) {
    const b = batchById(batchId);
    if (!b) { renderHome(); return; }

    const paras = (b.paragraphs || []).map((p) => {
      return '<article class="para">' +
        '<p class="en">' + enHTML(p.en, b.id) + '</p>' +
        (p.zh ? '<p class="zh">' + zhHTML(p.zh) + '</p>' : '') +
        '</article>';
    }).join('');

    const wordCards = (b.words || []).map((w) => {
      const f = flags[w.lemma];
      const badge = f ? '<span class="state ' + f + '">' + (f === 'known' ? '已掌握' : '待复习') + '</span>' : '';
      return '<button class="word-card" data-lemma="' + esc(w.lemma) + '" data-batch="' + esc(b.id) + '">' +
        badge +
        '<span class="w"><b>' + esc(w.lemma) + '</b><i>' + esc(w.pos || '') + '</i></span>' +
        '<span class="m">' + esc(w.meaning) + '</span>' +
        '</button>';
    }).join('');

    const focus = (b.focus || []).map((f) => '<code>' + esc(f) + '</code>').join('');
    const idx = batches().findIndex((x) => x.id === b.id);
    const next = batches()[idx + 1];

    app.innerHTML = '' +
      '<a class="back" href="#/">← 返回批次列表</a>' +
      '<header class="read-head">' +
      '<h1>' + esc(b.title) + '</h1>' +
      '<div class="zh-title">' + esc(b.titleZh || '') + '</div>' +
      '<div class="read-meta">' +
      '<span class="pill">' + esc(b.genre || '') + '</span>' +
      '<span class="dot">·</span><span>' + (b.words || []).length + ' 个词</span>' +
      '<span class="dot">·</span><span>' + esc(b.date || '') + '</span>' +
      '</div>' +
      (b.note ? '<p class="read-note">' + esc(b.note) + '</p>' : '') +
      '</header>' +

      '<div class="read-toolbar">' +
      '<div class="seg" data-seg="mode">' +
      '<button data-mode="en">英文</button>' +
      '<button data-mode="bi">中英对照</button>' +
      '<button data-mode="zh">中文</button>' +
      '</div>' +
      '<button class="tool-btn" id="hlBtn" aria-pressed="true">高亮生词</button>' +
      '<span class="tool-spacer"></span>' +
      '<button class="tool-btn" data-size="-1" title="缩小字号">A−</button>' +
      '<button class="tool-btn" data-size="1" title="放大字号">A＋</button>' +
      '<button class="tool-btn" id="printBtn">打印 / 存 PDF</button>' +
      '</div>' +

      '<div class="reader" data-mode="bi">' + paras + '</div>' +

      '<div class="section-head"><h2>本批词表</h2><span>点任意卡片查看释义、搭配与易混辨析</span></div>' +
      '<div class="word-grid">' + wordCards + '</div>' +

      (focus ? '<div class="section-head"><h2>重点搭配</h2><span>写作、翻译可直接用</span></div>' +
        '<div class="focus-list">' + focus + '</div>' : '') +

      '<div class="read-toolbar" style="margin-top:40px">' +
      '<a class="btn" href="#/review">去复习这几个词</a>' +
      (next ? '<a class="btn" href="#/b/' + esc(next.id) + '">下一批：' + esc(next.title) + ' →</a>' : '') +
      '</div>';

    applyReaderPrefs();

    if (pendingWord) {
      const pw = pendingWord;
      pendingWord = null;
      openPanel(pw, pw, b.id);
    }
  }

  function applyReaderPrefs() {
    const r = $('.reader');
    if (r) {
      r.dataset.mode = prefs.mode;
      r.classList.toggle('no-hl', !prefs.hl);
      r.style.setProperty('--read-size', prefs.size + 'px');
    }
    $$('.seg[data-seg="mode"] button').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.mode === prefs.mode));
    });
    const hl = $('#hlBtn');
    if (hl) hl.setAttribute('aria-pressed', String(!!prefs.hl));
  }

  function renderLexicon(fieldId) {
    const fs = fields();
    if (!fs.length) {
      app.innerHTML = '<div class="empty"><b>还没有领域数据</b>在 data.js 里补充 fields 与 lexicon。</div>';
      return;
    }
    const cur = fieldById(fieldId) || fs[0];
    const items = lexiconOf(cur.id);

    const tabs = fs.map((f) =>
      '<a class="filter-chip" href="#/lexicon/' + esc(f.id) + '" aria-pressed="' + (f.id === cur.id) + '">' +
      esc(f.name) + '<span class="cnt">' + lexiconOf(f.id).length + '</span></a>'
    ).join('');

    const cards = items.map((x) =>
      '<button class="lex-card" data-copy="' + esc(x.en) + '" title="点击复制英文">' +
      '<div class="lex-en">' + esc(x.en) + '</div>' +
      '<div class="lex-zh">' + esc(x.zh) + '</div>' +
      (x.note ? '<div class="lex-note">' + esc(x.note) + '</div>' : '') +
      '</button>'
    ).join('');

    app.innerHTML = '' +
      '<div class="page-head">' +
      '<div class="eyebrow">领域词汇</div>' +
      '<h1 class="page-title">各领域的常用说法</h1>' +
      '<p class="page-sub">英语阅读常在这几个领域出题。点卡片复制英文，写作、翻译可以直接用。</p>' +
      '</div>' +
      '<div class="filters">' + tabs + '</div>' +
      (items.length
        ? '<div class="lex-grid">' + cards + '</div>'
        : '<div class="empty"><b>这个领域还没有词条</b>以后会补上。</div>') +
      '<div class="read-toolbar" style="margin-top:36px">' +
      '<a class="btn" href="#/">回到批次列表</a>' +
      '</div>';
  }

  function fmtDate(ts) {
    try { return new Date(ts).toLocaleDateString('zh-CN'); } catch (e) { return ''; }
  }

  function renderNotebook() {
    const items = notebook.slice();
    const known = items.filter((n) => flags[n.term] === 'known').length;
    const pending = items.filter((n) => flags[n.term] === 'new').length;

    const cards = items.map((n) => {
      const f = flags[n.term];
      return '<article class="nb-card">' +
        '<div class="nb-head">' +
        '<b>' + esc(n.term) + '</b>' +
        (n.ipa ? '<i>' + esc(n.ipa) + '</i>' : '') +
        (n.pos ? '<span class="nb-pos">' + esc(n.pos) + '</span>' : '') +
        (f ? '<span class="state ' + f + '">' + (f === 'known' ? '已掌握' : '待复习') + '</span>' : '') +
        '</div>' +
        '<div class="nb-zh">' + esc(n.zh || '（没有释义）') + '</div>' +
        (n.collocation ? '<div class="nb-coll">' + esc(n.collocation) + '</div>' : '') +
        '<div class="nb-foot">' +
        '<span class="nb-from">' + esc(n.from || '划词') + (n.addedAt ? ' · ' + esc(fmtDate(n.addedAt)) : '') + '</span>' +
        '<span class="nb-acts">' +
        (n.batchId ? '<button class="sp-btn" data-nb-detail="' + esc(n.term) + '">详情</button>' : '') +
        '<button class="sp-btn" data-nb-flag="new" data-nb-term="' + esc(n.term) + '">待复习</button>' +
        '<button class="sp-btn" data-nb-flag="known" data-nb-term="' + esc(n.term) + '">已掌握</button>' +
        '<button class="sp-btn nb-del" data-nb-del="' + esc(n.term) + '">删除</button>' +
        '</span></div>' +
        '</article>';
    }).join('');

    const meta = '共 ' + items.length + ' 条' +
      (pending ? '，待复习 ' + pending + ' 条' : '') +
      (known ? '，已掌握 ' + known + ' 条' : '');

    app.innerHTML = '' +
      '<div class="page-head">' +
      '<div class="eyebrow">生词本</div>' +
      '<h1 class="page-title">自己收集的词</h1>' +
      '<p class="page-sub">阅读时选中任意词或短语，点「＋ 生词本」就能收进来。' + meta + '。</p>' +
      '</div>' +
      (items.length
        ? '<div class="read-toolbar" style="margin-bottom:20px">' +
          '<button class="btn btn-primary" data-review="notebook">复习生词本（' + items.length + '）</button>' +
          '<span class="tool-spacer"></span>' +
          '<button class="btn" data-act="clear-notebook">清空生词本</button>' +
          '</div>' +
          '<div class="nb-grid">' + cards + '</div>'
        : '<div class="empty"><b>生词本还是空的</b>阅读时选中一个词，点「＋ 生词本」；也可以点句中的高亮词，在右侧详情面板里加入。' +
          '<div class="stack" style="justify-content:center;margin-top:16px"><a class="btn" href="#/">去阅读</a></div></div>');
  }

  let listFilter = 'all';

  function renderList() {
    const ws = allWords();
    const shown = ws.filter((w) => listFilter === 'all' || flags[w.lemma] === listFilter);

    const rows = shown.map((w) => {
      const f = flags[w.lemma];
      const badge = f ? '<span class="state ' + f + '">' + (f === 'known' ? '已掌握' : '待复习') + '</span>' : '<span style="color:var(--ink-3)">—</span>';
      return '<tr data-lemma="' + esc(w.lemma) + '" data-batch="' + esc(w.batchId) + '">' +
        '<td><span class="lemma">' + esc(w.lemma) + '</span><span class="ipa">' + esc(w.ipa || '') + '</span></td>' +
        '<td>' + esc(w.meaning) + '</td>' +
        '<td class="coll hide-sm">' + esc(w.collocation || '') + '</td>' +
        '<td class="hide-sm" style="color:var(--ink-3);font-size:12.5px">' + esc(w.batchTitle || '') + '</td>' +
        '<td class="state-cell">' + badge + '</td>' +
        '</tr>';
    }).join('');

    const chip = (k, label) => '<button class="filter-chip" data-filter="' + k + '" aria-pressed="' + (listFilter === k) + '">' + label + '</button>';

    app.innerHTML = '' +
      '<div class="page-head">' +
      '<div class="eyebrow">全部词条</div>' +
      '<h1 class="page-title">词表</h1>' +
      '<p class="page-sub">共 ' + ws.length + ' 个词，点一行看详情；状态保存在本机浏览器里。</p>' +
      '</div>' +
      '<div class="filters">' + chip('all', '全部') + chip('new', '待复习') + chip('known', '已掌握') + '</div>' +
      (shown.length
        ? '<div class="table-wrap"><table><thead><tr><th>单词</th><th>释义</th><th class="hide-sm">搭配</th><th class="hide-sm">批次</th><th>状态</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
        : '<div class="empty"><b>这里还没有词</b>换个筛选条件，或者先去阅读页标记几个词。</div>');
  }

  let rv = null;

  function reviewStart(scope) {
    let pool = allWords();
    if (scope === 'new') {
      const filtered = pool.filter((w) => flags[w.lemma] === 'new');
      if (!filtered.length) { toast('还没有“待复习”的词，先给你全部词'); }
      else pool = filtered;
    } else if (scope === 'notebook') {
      const nbPool = notebook.map((n) => ({
        lemma: n.term,
        meaning: n.zh || '（生词本条目，暂无释义）',
        pos: n.pos || '',
        ipa: n.ipa || '',
        collocation: n.collocation || '',
        batchId: n.batchId || '',
        inText: n.from || ''
      }));
      if (!nbPool.length) { toast('生词本还是空的，先加几个词'); }
      else pool = nbPool;
    }
    rv = { q: shuffle(pool.slice()), i: 0, show: false, known: 0, unknown: 0, scope: scope };
    render();
  }

  function renderReview() {
    if (!rv) {
      const known = allWords().filter((w) => flags[w.lemma] === 'known').length;
      const pending = allWords().filter((w) => flags[w.lemma] === 'new').length;
      app.innerHTML = '' +
        '<div class="page-head">' +
        '<div class="eyebrow">自测</div>' +
        '<h1 class="page-title">复习</h1>' +
        '<p class="page-sub">看中文和例句，回忆出英文单词再翻牌。已掌握 ' + known + ' 个，待复习 ' + pending + ' 个。</p>' +
        '</div>' +
        '<div class="empty">' +
        '<b>选个范围开始</b>' +
        '<div class="stack" style="justify-content:center;margin-top:18px">' +
        '<button class="btn btn-primary" data-review="new">复习待复习的（' + pending + '）</button>' +
        '<button class="btn" data-review="all">复习全部（' + allWords().length + '）</button>' +
        (notebook.length ? '<button class="btn" data-review="notebook">复习生词本（' + notebook.length + '）</button>' : '') +
        '</div></div>';
      return;
    }

    if (rv.i >= rv.q.length) {
      app.innerHTML = '' +
        '<div class="review-stage">' +
        '<div class="page-head"><div class="eyebrow">完成</div><h1 class="page-title">这一轮结束</h1></div>' +
        '<div class="flash"><div class="q-label">本轮结果</div>' +
        '<div class="a-word" style="font-size:34px">' + rv.known + ' / ' + rv.q.length + '</div>' +
        '<p class="reveal-hint">记住 ' + rv.known + ' 个，没记住 ' + rv.unknown + ' 个。没记住的已经留在“待复习”里了。</p></div>' +
        '<div class="review-bar"><button class="btn btn-primary" data-review="' + (rv.scope || 'new') + '">再来一轮</button>' +
        '<a class="btn" href="#/list">去词表看看</a></div>' +
        '</div>';
      return;
    }

    const w = rv.q[rv.i];
    const ex = exampleFor(batchById(w.batchId), w.lemma);
    const pct = Math.round((rv.i / rv.q.length) * 100);

    const front = '' +
      '<div class="q-label">第 ' + (rv.i + 1) + ' / ' + rv.q.length + ' 个</div>' +
      '<div class="q-mean">' + esc(w.meaning) + '</div>' +
      '<div class="q-pos">' + esc(w.pos || '') + (w.inText ? ' · 文中：' + esc(w.inText) : '') + '</div>' +
      (ex ? '<div class="q-sent">' + esc(ex.before) + '<span style="border-bottom:2px solid var(--accent-2);padding:0 18px"></span>' + esc(ex.after) + '</div>' : '');

    const back = '' +
      '<div class="q-label">答案</div>' +
      '<div class="a-word">' + esc(w.lemma) + '</div>' +
      '<div class="a-ipa">' + esc(w.ipa || '') + '</div>' +
      (w.collocation ? '<div class="a-coll">' + esc(w.collocation) + '</div>' : '') +
      (ex ? '<div class="q-sent">' + esc(ex.before) + '<b>' + esc(ex.word) + '</b>' + esc(ex.after) + '</div>' : '');

    app.innerHTML = '' +
      '<div class="review-stage">' +
      '<div class="progress-line"><i style="width:' + pct + '%"></i></div>' +
      '<div class="flash">' + (rv.show ? back : front) + '</div>' +
      (rv.show
        ? '<div class="review-bar">' +
          '<button class="btn btn-new" data-answer="0">还是没记住</button>' +
          '<button class="btn btn-known" data-answer="1">记住了</button>' +
          '</div>'
        : '<div class="review-bar"><button class="btn btn-primary" data-reveal="1">显示答案</button>' +
          '<button class="btn btn-ghost" data-skip="1">跳过</button></div>') +
      '</div>';
  }

  function renderSettings() {
    const ws = allWords();
    const known = ws.filter((w) => flags[w.lemma] === 'known').length;
    const pending = ws.filter((w) => flags[w.lemma] === 'new').length;
    const themeOpts = [['auto', '跟随系统'], ['light', '浅色'], ['dark', '深色']]
      .map(([v, l]) => '<button class="filter-chip" data-theme-set="' + v + '" aria-pressed="' + (prefs.theme === v) + '">' + l + '</button>').join('');

    app.innerHTML = '' +
      '<div class="page-head"><div class="eyebrow">偏好与数据</div><h1 class="page-title">设置</h1></div>' +
      '<div class="settings-grid">' +

      '<section class="card"><h3>外观</h3><p class="hint">字号在阅读页也能用 A− / A＋ 临时调。</p>' +
      '<div class="row"><label>配色</label><div class="stack">' + themeOpts + '</div></div>' +
      '<div class="row"><label>阅读字号</label><div class="stack">' +
      '<button class="filter-chip" data-size-set="17" aria-pressed="' + (prefs.size === 17) + '">小</button>' +
      '<button class="filter-chip" data-size-set="19" aria-pressed="' + (prefs.size === 19) + '">中</button>' +
      '<button class="filter-chip" data-size-set="21" aria-pressed="' + (prefs.size === 21) + '">大</button>' +
      '</div></div>' +
      '<div class="row"><label>划词弹窗<br><span style="font-size:12px;color:var(--ink-3)">装了别的划词插件时建议关掉</span></label><div class="stack">' +
      '<button class="filter-chip" data-selpop="1" aria-pressed="' + (prefs.selPop !== false) + '">开</button>' +
      '<button class="filter-chip" data-selpop="0" aria-pressed="' + (prefs.selPop === false) + '">关</button>' +
      '</div></div></section>' +

      '<section class="card"><h3>进度</h3><p class="hint">标记只存在这台电脑的浏览器里，换设备或清缓存会丢，记得导出备份。</p>' +
      '<div class="row"><label>词条总数</label><b>' + ws.length + '</b></div>' +
      '<div class="row"><label>已掌握</label><b style="color:var(--known)">' + known + '</b></div>' +
      '<div class="row"><label>待复习</label><b style="color:var(--new)">' + pending + '</b></div>' +
      '<div class="row"><label>生词本</label><b>' + notebook.length + '</b></div>' +
      '<div class="row"><label>清除所有标记</label><button class="btn" data-act="clear-flags">清除</button></div>' +
      '<div class="row"><label>清空生词本</label><button class="btn" data-act="clear-notebook">清空</button></div>' +
      '</section>' +

      '<section class="card"><h3>备份与迁移</h3><p class="hint">导出会生成一个 JSON 文件，包含你的标记和导入过的批次。</p>' +
      '<div class="stack"><button class="btn btn-primary" data-act="export">导出备份</button>' +
      '<button class="btn" data-act="import">导入备份</button>' +
      '<input id="importFile" type="file" accept=".json,application/json" hidden></div>' +
      '</section>' +

      '<section class="card" id="syncCard"></section>' +

      '<section class="card"><h3>添加新批次</h3><p class="hint">把下面这段示例复制走，改成你自己的词，粘贴回来即可。也可以直接编辑 data.js。</p>' +
      '<textarea id="batchJSON" spellcheck="false" placeholder="{ ... }">' + esc(JSON.stringify(sampleBatch(), null, 2)) + '</textarea>' +
      '<div class="stack" style="margin-top:10px"><button class="btn btn-primary" data-act="add-batch">导入这段批次</button></div>' +
      '</section>' +

      '<section class="card"><h3>使用提示</h3><p class="hint">' +
      '· 阅读页点任意高亮的词，右侧弹出释义、搭配、易混辨析和原句。<br>' +
      '· 选中句中的词或短语，弹窗里点「＋ 生词本」就能收进生词本，之后可单独复习。<br>' +
      '· 词可以标“待复习 / 已掌握”，复习页会自动抽出来做成翻牌自测。<br>' +
      '· 搜索框支持英文、中文、搭配、生词本混搜，快捷键 <code>/</code>。<br>' +
      '· 阅读页“打印 / 存 PDF”会同时输出英文和中文，适合打印出来手写。' +
      '</p></section>' +

      '</div>';

    if (window.CET6Sync) {
      window.CET6Sync.mount($('#syncCard'), { getState: syncGetState, applyState: syncApplyState });
    }
  }

  function sampleBatch() {
    return {
      id: 'b99',
      title: 'Your Next Passage',
      titleZh: '你的下一篇短文',
      genre: '说明文',
      date: new Date().toISOString().slice(0, 10),
      paragraphs: [
        {
          en: 'Write the English passage here, and wrap each target word like [[word]] or [[changed|change]].',
          zh: '这里写中文译文，用 **加粗** 标出对应的词。'
        }
      ],
      focus: ['a useful collocation'],
      words: [
        {
          lemma: 'word', pos: 'n.', ipa: '/wɜːd/', meaning: '词；单词',
          inText: '文中义', collocation: 'a useful collocation',
          diff: '易混点或记忆提示。'
        }
      ]
    };
  }

  /* =========================================================
     单词详情面板
     ========================================================= */

  let closeTimer = null;

  function openPanel(lemma, surface, batchId) {
    const w = wordByLemma(lemma);
    if (!w) return;
    clearTimeout(closeTimer);
    const b = batchById(w.batchId) || batchById(batchId);
    const ex = b ? exampleFor(b, lemma) : null;
    const f = flags[lemma];

    const exHTML = ex
      ? '<div class="p-block"><div class="k">原句</div><div class="v quote">' +
        esc(ex.before) + '<b>' + esc(ex.word) + '</b>' + esc(ex.after) + '</div></div>'
      : '';

    const panel = $('#panel');
    panel.innerHTML = '' +
      '<div class="panel-head">' +
      '<button class="close" data-close="1" aria-label="关闭">×</button>' +
      '<h2>' + esc(w.lemma) + '</h2>' +
      '<div class="panel-ipa">' + esc(w.ipa || '') + '</div>' +
      '<span class="panel-pos">' + esc(w.pos || '') + '</span>' +
      (f ? '<span class="state ' + f + '" style="margin-left:6px">' + (f === 'known' ? '已掌握' : '待复习') + '</span>' : '') +
      '</div>' +
      '<div class="panel-body">' +
      '<div class="p-block"><div class="k">释义</div><div class="v">' + esc(w.meaning) + '</div></div>' +
      (w.inText ? '<div class="p-block"><div class="k">文中义</div><div class="v">' + esc(w.inText) + '</div></div>' : '') +
      (w.collocation ? '<div class="p-block"><div class="k">常用搭配</div><div class="v en">' + esc(w.collocation) + '</div></div>' : '') +
      (w.diff ? '<div class="p-block"><div class="k">辨析 / 记忆点</div><div class="v">' + esc(w.diff) + '</div></div>' : '') +
      exHTML +
      (b ? '<div class="p-block"><div class="k">出自</div><div class="v"><a href="#/b/' + esc(b.id) + '" data-close="1" style="color:var(--accent)">' + esc(b.title) + '</a></div></div>' : '') +
      '</div>' +
      '<div class="panel-foot">' +
      '<button class="btn btn-new" data-flag="new">待复习</button>' +
      '<button class="btn btn-known" data-flag="known">已掌握</button>' +
      (nbHas(w.lemma)
        ? '<button class="btn" disabled style="opacity:.5">已在生词本</button>'
        : '<button class="btn" data-nb-word="' + esc(w.lemma) + '">＋ 生词本</button>') +
      '</div>';

    panel.hidden = false;
    panel.dataset.lemma = lemma;
    const scrim = $('#scrim');
    scrim.hidden = false;
    requestAnimationFrame(() => { panel.classList.add('show'); scrim.classList.add('show'); });
    panel.setAttribute('aria-hidden', 'false');
  }

  function closePanel() {
    const panel = $('#panel');
    if (!panel || panel.hidden) return;
    panel.classList.remove('show');
    panel.setAttribute('aria-hidden', 'true');
    const scrim = $('#scrim');
    scrim.classList.remove('show');
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => { panel.hidden = true; scrim.hidden = true; }, 230);
  }

  function setFlag(lemma, value, skipPanel) {
    if (!value) delete flags[lemma];
    else flags[lemma] = value;
    saveFlags();
    syncMarks();
    const panel = $('#panel');
    if (!skipPanel && panel && panel.dataset.lemma === lemma) openPanel(lemma, lemma);
    // 词表页/阅读页的状态徽标
    $$('.word-card').forEach((c) => {
      if (c.dataset.lemma === lemma) {
        const old = $('.state', c);
        if (old) old.remove();
        const val = flags[lemma];
        if (val) {
          const s = document.createElement('span');
          s.className = 'state ' + val;
          s.textContent = val === 'known' ? '已掌握' : '待复习';
          c.insertBefore(s, c.firstChild);
        }
      }
    });
    toast(value === 'known' ? '标记为已掌握' : '加入待复习');
  }

  /* =========================================================
     复制
     ========================================================= */

  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); }
    catch (e) { toast('复制失败，请手动选中'); }
    ta.remove();
  }

  function copyText(text) {
    const done = () => toast('已复制：' + (text.length > 16 ? text.slice(0, 16) + '…' : text));
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
        return;
      }
    } catch (e) { /* 走降级方案 */ }
    fallbackCopy(text, done);
  }

  /* =========================================================
     划词：先查本地词库，查不到再联网翻译
     ========================================================= */

  const selPop = $('#selPop');
  let selToken = 0;
  let mtCache = LS.get('cet6.mt.cache', {});
  let mtPref = LS.get('cet6.mt.pref', '');

  const MT_ENDPOINTS = {
    mymemory: function (text, from, to) {
      const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=' + encodeURIComponent(from + '|' + to);
      return getJSON(url).then((j) => {
        const t = j && j.responseData && j.responseData.translatedText;
        if (!t || /MYMEMORY WARNING/i.test(t)) throw new Error('rate limited');
        return t;
      });
    },
    google: function (text, from, to) {
      const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + from + '&tl=' + to + '&dt=t&q=' + encodeURIComponent(text);
      return getJSON(url).then((j) => {
        if (!Array.isArray(j) || !Array.isArray(j[0])) throw new Error('bad response');
        return j[0].map((seg) => (seg && seg[0] ? seg[0] : '')).join('');
      });
    }
  };

  function getJSON(url, ms) {
    return new Promise((resolve, reject) => {
      const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timer = setTimeout(() => {
        if (ctl) { try { ctl.abort(); } catch (e) { } }
        reject(new Error('timeout'));
      }, ms || 4000);
      fetch(url, ctl ? { signal: ctl.signal } : {}).then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then((j) => { clearTimeout(timer); resolve(j); })
        .catch((e) => { clearTimeout(timer); reject(e); });
    });
  }

  function saveMTCache() {
    const keys = Object.keys(mtCache);
    if (keys.length > 600) keys.slice(0, keys.length - 600).forEach((k) => { delete mtCache[k]; });
    LS.set('cet6.mt.cache', mtCache);
  }

  function translateText(text) {
    const key = text.toLowerCase();
    if (mtCache[key]) return Promise.resolve({ zh: mtCache[key], provider: 'cache' });

    const isZh = /[\u4e00-\u9fff]/.test(text);
    const from = isZh ? 'zh-CN' : 'en';
    const to = isZh ? 'en' : 'zh-CN';
    const base = ['mymemory', 'google'];
    const order = (mtPref && base.indexOf(mtPref) >= 0) ? [mtPref].concat(base.filter((p) => p !== mtPref)) : base;

    let i = 0;
    const next = () => {
      if (i >= order.length) return Promise.reject(new Error('all providers failed'));
      const name = order[i++];
      return MT_ENDPOINTS[name](text, from, to).then((r) => {
        if (!r) throw new Error('empty');
        mtCache[key] = r;
        saveMTCache();
        if (mtPref !== name) { mtPref = name; LS.set('cet6.mt.pref', mtPref); }
        return { zh: r, provider: name };
      }).catch(next);
    };
    return next();
  }

  function normalizeTerm(raw) {
    return String(raw).toLowerCase().replace(/[^a-z\s'’-]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function stemCandidates(t) {
    const out = [];
    const push = (x) => { if (x && x.length > 2 && out.indexOf(x) < 0) out.push(x); };
    if (/ies$/.test(t)) push(t.slice(0, -3) + 'y');
    if (/ied$/.test(t)) push(t.slice(0, -3) + 'y');
    if (/es$/.test(t)) push(t.slice(0, -2));
    if (/s$/.test(t)) push(t.slice(0, -1));
    if (/ed$/.test(t)) { push(t.slice(0, -2)); push(t.slice(0, -1)); if (/(.)\1ed$/.test(t)) push(t.slice(0, -3)); }
    if (/ing$/.test(t)) { push(t.slice(0, -3)); push(t.slice(0, -3) + 'e'); if (/(.)\1ing$/.test(t)) push(t.slice(0, -4)); }
    if (/ly$/.test(t)) push(t.slice(0, -2));
    return out;
  }

  function lookupTerm(raw) {
    const t = normalizeTerm(raw);
    if (!t) return null;
    let w = wordByLemma(t);
    if (w) return { w: w, form: t };
    const cands = stemCandidates(t);
    for (let i = 0; i < cands.length; i++) {
      w = wordByLemma(cands[i]);
      if (w) return { w: w, form: t };
    }
    if (t.indexOf(' ') >= 0) {
      const hit = allWords().filter((x) => (x.collocation || '').toLowerCase().indexOf(t) >= 0)[0];
      if (hit) return { w: hit, form: t, via: 'collocation' };
    }
    return null;
  }

  function hideSel() {
    if (!selPop) return;
    selPop.hidden = true;
    selPop.innerHTML = '';
  }

  function placeSel(rect) {
    selPop.hidden = false;
    const w = selPop.offsetWidth, h = selPop.offsetHeight;
    const vw = window.innerWidth || 1024, vh = window.innerHeight || 768;
    let left = rect.left + rect.width / 2 - w / 2;
    left = Math.max(12, Math.min(left, vw - w - 12));
    let top = rect.bottom + 10;
    if (top + h > vh - 12) top = Math.max(12, rect.top - h - 10);
    selPop.style.left = Math.round(left) + 'px';
    selPop.style.top = Math.round(top) + 'px';
  }

  function selHTML(text) {
    const hit = lookupTerm(text);
    if (hit) {
      const w = hit.w;
      const f = flags[w.lemma];
      return '' +
        '<div class="sp-head">' +
        '<span class="sp-word">' + esc(w.lemma) + '</span>' +
        '<span class="sp-ipa">' + esc(w.ipa || '') + '</span>' +
        (f ? '<span class="state ' + f + '">' + (f === 'known' ? '已掌握' : '待复习') + '</span>' : '') +
        '</div>' +
        '<div class="sp-mean">' + esc(w.meaning) + '</div>' +
        (hit.form && hit.form !== w.lemma ? '<div class="sp-form">原文：' + esc(text) + '</div>' : '') +
        (w.collocation ? '<div class="sp-coll">' + esc(w.collocation) + '</div>' : '') +
        '<div class="sp-acts">' +
        (nbHas(w.lemma)
          ? '<button class="sp-btn sp-btn-on" disabled>已在生词本</button>'
          : '<button class="sp-btn sp-btn-primary" data-nb-word="' + esc(w.lemma) + '">＋ 生词本</button>') +
        '<button class="sp-btn" data-sel-detail="' + esc(w.lemma) + '">详情</button>' +
        '<button class="sp-btn" data-sel-flag="new" data-sel-lemma="' + esc(w.lemma) + '">待复习</button>' +
        '<button class="sp-btn" data-sel-flag="known" data-sel-lemma="' + esc(w.lemma) + '">已掌握</button>' +
        '</div>';
    }
    return '<div class="sp-head"><span class="sp-word">' + esc(text) + '</span></div>' +
      '<div class="sp-mean sp-dim" data-sel-body="1">查询中…</div>';
  }

  function openSel(text, rect) {
    if (!selPop) return;
    const token = ++selToken;
    selPop.dataset.text = text;
    selPop._rect = rect;
    selPop.innerHTML = selHTML(text);
    placeSel(rect);

    if (lookupTerm(text)) return;

    translateText(text).then((r) => {
      if (token !== selToken) return;
      const body = $('[data-sel-body]', selPop);
      if (!body) return;
      body.className = 'sp-mean';
      body.textContent = r.zh;
      const acts = document.createElement('div');
      acts.className = 'sp-acts';
      acts.innerHTML =
        (nbHas(text)
          ? '<button class="sp-btn sp-btn-on" disabled>已在生词本</button>'
          : '<button class="sp-btn sp-btn-primary" data-nb-add="' + esc(text) + '" data-nb-zh="' + esc(r.zh) + '">＋ 生词本</button>') +
        '<button class="sp-btn" data-sel-copy="' + esc(r.zh) + '">复制译文</button>';
      selPop.appendChild(acts);
      placeSel(rect);
    }).catch(() => {
      if (token !== selToken) return;
      const body = $('[data-sel-body]', selPop);
      if (!body) return;
      body.className = 'sp-mean sp-err';
      body.innerHTML = '联网翻译不可用（没网或被拦截）。<div class="sp-acts"><button class="sp-btn" data-sel-retry="1">重试</button></div>';
    });
  }

  function refreshPopup() {
    if (!selPop || selPop.hidden) return;
    const txt = selPop.dataset.text, rect = selPop._rect;
    if (txt && rect) openSel(txt, rect);
  }

  function checkSelection() {
    if (!selPop || selPop.dataset.busy) return;
    if (prefs.selPop === false) { hideSel(); return; }
    const s = window.getSelection();
    if (!s || s.rangeCount === 0 || s.isCollapsed) { hideSel(); return; }
    const text = s.toString().replace(/\s+/g, ' ').trim();
    if (!text || text.length > 120) { hideSel(); return; }
    const range = s.getRangeAt(0);
    const node = range.commonAncestorContainer;
    const host = node.nodeType === 1 ? node : node.parentElement;
    if (!host || !app.contains(host)) return;
    const rect = range.getBoundingClientRect();
    if (!rect || (!rect.width && !rect.height)) return;
    openSel(text, rect);
  }

  document.addEventListener('mouseup', function () { setTimeout(checkSelection, 12); });
  document.addEventListener('touchend', function () { setTimeout(checkSelection, 240); });
  document.addEventListener('keyup', function (e) { if (e.shiftKey) setTimeout(checkSelection, 12); });
  document.addEventListener('mousedown', function (e) {
    if (selPop && !selPop.hidden && !selPop.contains(e.target)) hideSel();
  });
  window.addEventListener('scroll', function () { if (selPop && !selPop.hidden) hideSel(); }, true);

  if (selPop) {
    selPop.addEventListener('mousedown', function () {
      selPop.dataset.busy = '1';
      setTimeout(function () { delete selPop.dataset.busy; }, 420);
    });
  }

  /* =========================================================
     搜索
     ========================================================= */

  let searchTimer = null;
  let searchResults = [];

  function runSearch(q) {
    const panel = $('#searchPanel');
    q = (q || '').trim().toLowerCase();
    if (!q) { panel.hidden = true; panel.innerHTML = ''; searchResults = []; return; }

    const words = allWords().filter((w) =>
      (w.lemma || '').toLowerCase().indexOf(q) >= 0 ||
      (w.meaning || '').toLowerCase().indexOf(q) >= 0 ||
      (w.inText || '').toLowerCase().indexOf(q) >= 0 ||
      (w.collocation || '').toLowerCase().indexOf(q) >= 0 ||
      (w.diff || '').toLowerCase().indexOf(q) >= 0
    ).slice(0, 10);

    const bs = batches().filter((b) =>
      (b.title || '').toLowerCase().indexOf(q) >= 0 ||
      (b.titleZh || '').toLowerCase().indexOf(q) >= 0 ||
      (b.genre || '').toLowerCase().indexOf(q) >= 0
    ).slice(0, 3);

    const lex = allLexicon().filter((x) =>
      (x.en || '').toLowerCase().indexOf(q) >= 0 ||
      (x.zh || '').indexOf(q) >= 0 ||
      (x.note || '').indexOf(q) >= 0
    ).slice(0, 6);

    searchResults = words.map((w) => ({ type: 'w', lemma: w.lemma, batchId: w.batchId, meaning: w.meaning, title: w.batchTitle }));

    let html = '';
    if (words.length) {
      html += '<div class="sr-group">单词</div>' + words.map((w) =>
        '<button class="sr-item" data-lemma="' + esc(w.lemma) + '" data-batch="' + esc(w.batchId) + '">' +
        '<span class="sr-word">' + esc(w.lemma) + '</span>' +
        '<span class="sr-mean">' + esc(w.meaning) + '</span>' +
        '<span class="sr-batch">' + esc(w.batchTitle) + '</span>' +
        '</button>').join('');
    }
    if (bs.length) {
      html += '<div class="sr-group">批次</div>' + bs.map((b) =>
        '<button class="sr-item" data-goto-batch="' + esc(b.id) + '">' +
        '<span class="sr-word" style="font-size:14px">' + esc(b.title) + '</span>' +
        '<span class="sr-mean">' + esc(b.titleZh || '') + '</span>' +
        '<span class="sr-batch">' + (b.words || []).length + ' 词</span>' +
        '</button>').join('');
    }
    const nbHits = notebook.filter((n) =>
      String(n.term).toLowerCase().indexOf(q) >= 0 || String(n.zh || '').indexOf(q) >= 0
    ).slice(0, 5);

    if (nbHits.length) {
      html += '<div class="sr-group">生词本</div>' + nbHits.map((n) =>
        '<button class="sr-item" data-goto-nb="1">' +
        '<span class="sr-word" style="font-size:14px">' + esc(n.term) + '</span>' +
        '<span class="sr-mean">' + esc(n.zh || '') + '</span>' +
        '<span class="sr-batch">生词本</span>' +
        '</button>').join('');
    }

    if (lex.length) {
      html += '<div class="sr-group">领域词汇</div>' + lex.map((x) =>
        '<button class="sr-item" data-goto-lex="' + esc(x.field) + '">' +
        '<span class="sr-word" style="font-size:14px">' + esc(x.en) + '</span>' +
        '<span class="sr-mean">' + esc(x.zh) + '</span>' +
        '<span class="sr-batch">' + esc(x.fieldName) + '</span>' +
        '</button>').join('');
    }

    if (!html) html = '<div class="sr-empty">没找到“' + esc(q) + '”</div>';

    panel.innerHTML = html;
    panel.hidden = false;
    $$('.sr-item', panel).forEach((el) => el.classList.remove('is-active'));
    const first = $('.sr-item', panel);
    if (first) first.classList.add('is-active');
  }

  /* =========================================================
     路由
     ========================================================= */

  let pendingWord = null;

  function parseHash() {
    const h = location.hash.replace(/^#\/?/, '');
    const parts = h.split('/').filter(Boolean);
    if (!parts.length) return { name: 'home' };
    if (parts[0] === 'b') return { name: 'read', id: parts[1] };
    if (parts[0] === 'lexicon') return { name: 'lexicon', id: parts[1] };
    if (['list', 'review', 'settings', 'notebook'].indexOf(parts[0]) >= 0) return { name: parts[0] };
    return { name: 'home' };
  }

  function render() {
    const route = parseHash();
    closePanel();
    hideSel();

    if (route.name === 'read') renderReading(route.id);
    else if (route.name === 'lexicon') renderLexicon(route.id);
    else if (route.name === 'list') renderList();
    else if (route.name === 'notebook') renderNotebook();
    else if (route.name === 'review') renderReview();
    else if (route.name === 'settings') renderSettings();
    else renderHome();

    $$('#nav a').forEach((a) => {
      const isCurrent = a.dataset.nav === route.name ||
        (route.name === 'read' && a.dataset.nav === 'home');
      if (isCurrent) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    syncMarks();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  /* =========================================================
     事件绑定
     ========================================================= */

  window.addEventListener('hashchange', render);

  // 主题按钮：跟随系统 → 浅色 → 深色
  document.addEventListener('click', (e) => {
    // 生词本：加入
    const nbWordBtn = e.target.closest('[data-nb-word]');
    if (nbWordBtn) {
      const lemma = nbWordBtn.dataset.nbWord;
      const ok = nbAddWord(lemma);
      toast(ok ? '已加入生词本' : '已经在生词本里了');
      refreshPopup();
      const pn = $('#panel');
      if (pn && !pn.hidden && pn.dataset.lemma === lemma) openPanel(lemma, lemma);
      return;
    }

    const nbAddBtn = e.target.closest('[data-nb-add]');
    if (nbAddBtn) {
      const ok = nbAdd({ term: nbAddBtn.dataset.nbAdd, zh: nbAddBtn.dataset.nbZh, from: '划词' });
      toast(ok ? '已加入生词本' : '已经在生词本里了');
      refreshPopup();
      return;
    }

    // 生词本：删除 / 标记 / 详情
    const nbDelBtn = e.target.closest('[data-nb-del]');
    if (nbDelBtn) {
      nbRemove(nbDelBtn.dataset.nbDel);
      renderNotebook();
      toast('已从生词本移除');
      return;
    }

    const nbFlagBtn = e.target.closest('[data-nb-flag]');
    if (nbFlagBtn) {
      setFlag(nbFlagBtn.dataset.nbTerm, nbFlagBtn.dataset.nbFlag, true);
      renderNotebook();
      return;
    }

    const nbDetailBtn = e.target.closest('[data-nb-detail]');
    if (nbDetailBtn) {
      openPanel(nbDetailBtn.dataset.nbDetail, nbDetailBtn.dataset.nbDetail);
      return;
    }

    // 划词弹窗里的按钮
    const spBtn = e.target.closest('.sp-btn');
    if (spBtn) {
      if (spBtn.dataset.selDetail) {
        const l = spBtn.dataset.selDetail;
        hideSel();
        openPanel(l, l);
      } else if (spBtn.dataset.selFlag) {
        setFlag(spBtn.dataset.selLemma, spBtn.dataset.selFlag, true);
        const txt = selPop.dataset.text, rect = selPop._rect;
        if (txt && rect) openSel(txt, rect);
      } else if (spBtn.dataset.selCopy) {
        copyText(spBtn.dataset.selCopy);
      } else if (spBtn.dataset.selRetry) {
        const txt = selPop.dataset.text, rect = selPop._rect;
        if (txt && rect) openSel(txt, rect);
      }
      return;
    }

    // 领域词汇卡片：点击复制
    const lexCard = e.target.closest('[data-copy]');
    if (lexCard) { copyText(lexCard.dataset.copy); return; }

    // 首页按领域筛选
    const fieldBtn = e.target.closest('[data-home-field]');
    if (fieldBtn) { homeField = fieldBtn.dataset.homeField; renderHome(); return; }

    if (e.target.closest('#themeBtn')) {
      const order = ['auto', 'light', 'dark'];
      prefs.theme = order[(order.indexOf(prefs.theme) + 1) % order.length];
      savePrefs(); applyTheme();
      if (parseHash().name === 'settings') renderSettings();
      return;
    }

    const mark = e.target.closest('mark.v');
    if (mark) {
      const s = window.getSelection();
      if (s && !s.isCollapsed && s.toString().trim()) return; // 有选区时交给划词弹窗
      openPanel(mark.dataset.lemma, mark.dataset.surface, mark.dataset.batch);
      return;
    }

    const card = e.target.closest('.word-card');
    if (card) { openPanel(card.dataset.lemma, card.dataset.lemma, card.dataset.batch); return; }

    const row = e.target.closest('tbody tr[data-lemma]');
    if (row) { openPanel(row.dataset.lemma, row.dataset.lemma, row.dataset.batch); return; }

    if (e.target.closest('[data-close]')) { closePanel(); return; }
    if (e.target.id === 'scrim') { closePanel(); return; }

    const flagBtn = e.target.closest('[data-flag]');
    if (flagBtn) { setFlag($('#panel').dataset.lemma, flagBtn.dataset.flag); return; }

    // 阅读工具条
    const modeBtn = e.target.closest('.seg[data-seg="mode"] button');
    if (modeBtn) {
      prefs.mode = modeBtn.dataset.mode; savePrefs(); applyReaderPrefs(); return;
    }
    if (e.target.closest('#hlBtn')) {
      prefs.hl = !prefs.hl; savePrefs(); applyReaderPrefs(); return;
    }
    const sizeBtn = e.target.closest('[data-size]');
    if (sizeBtn) {
      prefs.size = Math.min(26, Math.max(15, prefs.size + Number(sizeBtn.dataset.size)));
      savePrefs(); applyReaderPrefs(); return;
    }
    const sizeSet = e.target.closest('[data-size-set]');
    if (sizeSet) { prefs.size = Number(sizeSet.dataset.sizeSet); savePrefs(); renderSettings(); return; }

    const selPopBtn = e.target.closest('[data-selpop]');
    if (selPopBtn) {
      prefs.selPop = selPopBtn.dataset.selpop === '1';
      savePrefs();
      if (!prefs.selPop) hideSel();
      renderSettings();
      return;
    }

    const themeChip = e.target.closest('[data-theme-set]');
    if (themeChip) { prefs.theme = themeChip.dataset.themeSet; savePrefs(); applyTheme(); renderSettings(); return; }

    const filterChip = e.target.closest('[data-filter]');
    if (filterChip) { listFilter = filterChip.dataset.filter; renderList(); return; }

    const reviewBtn = e.target.closest('[data-review]');
    if (reviewBtn) { reviewStart(reviewBtn.dataset.review); return; }

    if (e.target.closest('[data-reveal]')) { rv.show = true; renderReview(); return; }
    if (e.target.closest('[data-skip]')) { rv.i++; rv.show = false; renderReview(); return; }

    const ansBtn = e.target.closest('[data-answer]');
    if (ansBtn) {
      const w = rv.q[rv.i];
      const ok = ansBtn.dataset.answer === '1';
      flags[w.lemma] = ok ? 'known' : 'new';
      saveFlags();
      if (ok) rv.known++; else rv.unknown++;
      rv.i++; rv.show = false;
      renderReview();
      return;
    }

    if (e.target.closest('#printBtn')) { window.print(); return; }

    // 设置页操作
    const act = e.target.closest('[data-act]');
    if (act) {
      const a = act.dataset.act;
      if (a === 'export') exportBackup();
      else if (a === 'import') $('#importFile').click();
      else if (a === 'clear-flags') {
        if (confirm('确定清除所有“已掌握 / 待复习”标记吗？此操作不可撤销。')) {
          flags = {}; saveFlags(); toast('已清除'); renderSettings();
        }
      } else if (a === 'clear-notebook') {
        if (confirm('确定清空生词本吗？此操作不可撤销。')) {
          notebook = []; saveNotebook(); toast('生词本已清空'); render();
        }
      } else if (a === 'add-batch') {
        try {
          const data = JSON.parse($('#batchJSON').value);
          const arr = Array.isArray(data) ? data : [data];
          arr.forEach((b) => {
            if (!b || !b.id || !b.words) throw new Error('缺少 id 或 words 字段');
            if (batches().some((x) => x.id === b.id)) b.id = b.id + '-' + Date.now().toString(36).slice(-4);
            extra.push(b);
          });
          saveExtra();
          toast('已导入 ' + arr.length + ' 个批次');
          location.hash = '#/';
        } catch (err) {
          alert('导入失败：' + err.message);
        }
      }
      return;
    }

    // 搜索
    const srItem = e.target.closest('.sr-item');
    if (srItem) {
      $('#searchPanel').hidden = true;
      $('#search').value = '';
      let target;
      if (srItem.dataset.gotoBatch) target = '#/b/' + srItem.dataset.gotoBatch;
      else if (srItem.dataset.gotoLex) target = '#/lexicon/' + srItem.dataset.gotoLex;
      else if (srItem.dataset.gotoNb) target = '#/notebook';
      else { target = '#/b/' + srItem.dataset.batch; pendingWord = srItem.dataset.lemma; }
      if (location.hash === target) render();
      else location.hash = target;
      return;
    }
  });

  // 搜索输入
  $('#search').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    const v = e.target.value;
    searchTimer = setTimeout(() => runSearch(v), 90);
  });

  $('#search').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = $('#searchPanel .sr-item');
      if (first) first.click();
    } else if (e.key === 'Escape') {
      $('#searchPanel').hidden = true;
      e.target.blur();
    }
  });

  $('#search').addEventListener('focus', (e) => {
    if (e.target.value.trim()) runSearch(e.target.value);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search')) $('#searchPanel').hidden = true;
  });

  // 键盘快捷键
  document.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    const typing = tag === 'input' || tag === 'textarea';
    if (e.key === '/' && !typing) {
      e.preventDefault();
      $('#search').focus();
    } else if (e.key === 'Escape') {
      closePanel();
      $('#searchPanel').hidden = true;
    } else if (e.key === ' ' && !typing && rv && !rv.show && parseHash().name === 'review') {
      e.preventDefault();
      rv.show = true; renderReview();
    }
  });

  // 导入备份
  document.addEventListener('change', (e) => {
    if (e.target.id !== 'importFile') return;
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.flags && typeof data.flags === 'object') {
          Object.keys(data.flags).forEach((k) => { flags[k] = data.flags[k]; });
          saveFlags();
        }
        if (Array.isArray(data.extra)) {
          data.extra.forEach((b) => {
            if (b && b.id && !batches().some((x) => x.id === b.id)) extra.push(b);
          });
          saveExtra();
        }
        if (Array.isArray(data.notebook)) {
          data.notebook.forEach((n) => {
            if (n && n.term && !nbHas(n.term)) notebook.push(n);
          });
          saveNotebook();
        }
        if (data.prefs) { prefs = Object.assign(prefs, data.prefs); savePrefs(); applyTheme(); }
        toast('导入成功');
        render();
      } catch (err) {
        alert('文件格式不对：' + err.message);
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  });

  function exportBackup() {
    const payload = {
      app: 'cet6-reader',
      version: 1,
      exportedAt: new Date().toISOString(),
      prefs: prefs,
      flags: flags,
      extra: extra,
      notebook: notebook
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cet6-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('备份已导出');
  }

  /* ---------------- 启动 ---------------- */
  applyTheme();
  render();

  /* 调试 / 自检接口（test.js 会用） */
  window.__CET6__ = {
    exampleFor: exampleFor,
    enHTML: enHTML,
    zhHTML: zhHTML,
    allWords: allWords,
    batches: batches,
    fields: fields,
    allLexicon: allLexicon,
    lookupTerm: lookupTerm,
    nbAdd: nbAdd,
    nbAddWord: nbAddWord,
    nbHas: nbHas,
    nbRemove: nbRemove,
    getNotebook: function () { return notebook; },
    openPanel: openPanel,
    render: render,
    reviewStart: reviewStart,
    reviewNext: function () { rv.i++; rv.show = false; renderReview(); }
  };
})();
