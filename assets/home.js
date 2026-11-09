/* 个人主页 — 渲染逻辑
   ─────────────────────────────────────────────
   只改下面的 PROFILE 就够了，其余不用动。
   ───────────────────────────────────────────── */

const PROFILE = {
  name: 'LGH',
  kicker: 'PERSONAL SITE',
  sub: '在读、在写、在记。这里放我做过的东西，和一些还在长出来的念头。',
  note: '最近在整理六级词汇的阅读材料：每篇短文挑十来个词，配释义、搭配和易混点。',

  // 顶部的三个胶囊按钮
  links: [
    { label: 'GitHub', sub: '@l1g2h3', href: 'https://github.com/l1g2h3' },
    { label: '词汇阅读本', sub: 'live', href: 'vocab/' },
    { label: '邮件', sub: '298137856@qq.com', href: 'mailto:298137856@qq.com' }
  ],

  // 模块卡片：tagKind 用 'live' 表示已上线，'soon' 表示在建
  modules: [
    {
      title: '六级词汇阅读本',
      tag: 'LIVE',
      tagKind: 'live',
      desc: '按领域分组的短文阅读，点词看释义、搭配与易混辨析；划词收进生词本，复习页做翻牌自测。支持多设备云同步。',
      href: 'vocab/',
      foot: 'HTML · 无构建 · 数据存 GitHub Gist'
    },
    {
      title: '读书笔记',
      tag: 'SOON',
      tagKind: 'soon',
      desc: '在读的书、划下来的句子、读完之后的几句话。还没开始，先占个位置。',
      href: '',
      foot: '待建'
    },
    {
      title: '小工具',
      tag: 'SOON',
      tagKind: 'soon',
      desc: '临时写的小脚本、格式转换、随手算的东西，够用就留下。',
      href: '',
      foot: '待建'
    }
  ],

  // 关于：数组每项一段，**加粗** 会生效
  about: [
    '我不是程序员，只是个爱把东西整理清楚的人。这个站点先是给六级词汇做的一个阅读本，后来想，不如把它变成正经的主页。',
    '做这些东西的原则很简单：**能离线就离线，能不加依赖就不加**。所以整个站点是几个静态文件，没有框架、没有构建步骤，改一行就能看到变化。',
    '如果你也在背单词，欢迎直接用那个阅读本；词库可以自己加。'
  ],

  contacts: [
    { label: 'GitHub', value: 'github.com/l1g2h3', href: 'https://github.com/l1g2h3' },
    { label: '邮箱', value: '298137856@qq.com', href: 'mailto:298137856@qq.com' },
    { label: '词汇阅读本', value: 'l1g2h3.github.io/vocab/', href: 'vocab/' }
  ]
};

/* ───────────── 以下不用改 ───────────── */

(function () {
  'use strict';

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const bold = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  const $ = (s) => document.querySelector(s);

  /* 与词汇页共用 cet6.prefs.v1 的 theme 字段，两边切换互相同步 */
  const PREF_KEY = 'cet6.prefs.v1';
  const readPrefs = () => {
    try { return JSON.parse(localStorage.getItem(PREF_KEY) || '{}') || {}; } catch (e) { return {}; }
  };
  const writeTheme = (theme) => {
    try {
      const p = readPrefs();
      p.theme = theme;
      localStorage.setItem(PREF_KEY, JSON.stringify(p));
    } catch (e) { /* 无痕模式忽略 */ }
  };

  function applyTheme() {
    const theme = readPrefs().theme || 'auto';
    const dark = theme === 'dark' || (theme === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    return theme;
  }

  function render() {
    document.title = PROFILE.name;
    $('#brandName').textContent = PROFILE.name;
    $('#heroKicker').textContent = PROFILE.kicker;
    $('#heroTitle').textContent = PROFILE.name;
    $('#heroSub').textContent = PROFILE.sub;
    $('#heroNote').textContent = PROFILE.note || '';
    $('#footName').textContent = PROFILE.name;
    $('#year').textContent = new Date().getFullYear();

    $('#heroLinks').innerHTML = (PROFILE.links || []).map((l) =>
      '<a class="chip" href="' + esc(l.href) + '"' + (l.href.startsWith('http') ? ' target="_blank" rel="noopener"' : '') + '>' +
      esc(l.label) + (l.sub ? '<span class="k">' + esc(l.sub) + '</span>' : '') + '</a>'
    ).join('');

    $('#modules').innerHTML = (PROFILE.modules || []).map((m) => {
      const inner =
        '<div class="card-top"><h3 class="card-title">' + esc(m.title) + '</h3>' +
        '<span class="card-tag ' + (m.tagKind === 'soon' ? 'soon' : '') + '">' + esc(m.tag || '') + '</span></div>' +
        '<p class="card-desc">' + esc(m.desc) + '</p>' +
        (m.foot ? '<div class="card-foot">' + esc(m.foot) + '</div>' : '');
      return m.href
        ? '<a class="card" href="' + esc(m.href) + '">' + inner + '</a>'
        : '<div class="card">' + inner + '</div>';
    }).join('');

    $('#aboutText').innerHTML = (PROFILE.about || []).map((p) => '<p>' + bold(p) + '</p>').join('');

    $('#contactList').innerHTML = (PROFILE.contacts || []).map((c) =>
      '<li><a href="' + esc(c.href) + '"' + (c.href.startsWith('http') ? ' target="_blank" rel="noopener"' : '') + '>' +
      esc(c.label) + '<span class="val">' + esc(c.value) + '</span></a></li>'
    ).join('');
  }

  $('#themeBtn').addEventListener('click', () => {
    const now = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    writeTheme(now);
    document.documentElement.dataset.theme = now;
  });

  applyTheme();
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => { if ((readPrefs().theme || 'auto') === 'auto') applyTheme(); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }
  render();
})();
