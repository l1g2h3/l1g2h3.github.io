/* 个人主页 — 渲染逻辑
   ─────────────────────────────────────────────
   只改下面的 PROFILE 就够了，其余不用动。
   ───────────────────────────────────────────── */

const PROFILE = {
  name: 'LGH',
  kicker: 'PERSONAL SITE',
  sub: '在读、在写、在记。这里放我做过的东西，和一些还在长出来的念头。',
  note: '最近在整理英语阅读的材料：每篇短文挑十来个词，配释义、搭配和易混点。',

  // 顶部的三个胶囊按钮
  links: [
    { label: 'GitHub', sub: '@l1g2h3', href: 'https://github.com/l1g2h3' },
    { label: '3D 城市', sub: 'beta', href: 'city/' },
    { label: '英语模块', sub: 'live', href: 'vocab/' },
    { label: '邮件', sub: '298137856@qq.com', href: 'mailto:298137856@qq.com' }
  ],

  // 模块卡片：tagKind 用 'live' 表示已上线，'soon' 表示在建，'plain' 表示资料类
  modules: [
    {
      title: '英语模块',
      tag: 'LIVE',
      tagKind: 'live',
      desc: '按领域分组的短文阅读，点词看释义、搭配与易混辨析；划词收进生词本，复习页做翻牌自测。支持多设备云同步。',
      href: 'vocab/',
      foot: 'HTML · 无构建 · 数据存 GitHub Gist'
    },
    {
      title: '数学建模竞赛',
      tag: '论文',
      tagKind: 'plain',
      desc: '赛题重述、模型假设、求解与灵敏度分析的完整论文归档。按年份整理，可直接下载 PDF。',
      href: '#papers',
      foot: 'PDF · LaTeX'
    },
    {
      title: '类脑强化学习',
      tag: '软著',
      tagKind: 'plain',
      desc: '脉冲神经网络与强化学习结合的方向：稀疏编码、时序信用分配、训练框架实验记录，附一项软件著作权登记。',
      href: '#papers',
      foot: 'Python · PyTorch · 软著'
    },
    {
      title: 'CT 协议 DSA 扫描路径规划',
      tag: '系统',
      tagKind: 'plain',
      desc: 'CT 引导下 DSA 扫描的路径规划：血管分割、入路约束建模与路径代价优化，输出可执行的扫描序列。',
      href: '#papers',
      foot: '影像处理 · 路径规划'
    },
    {
      title: '手术机器人',
      tag: '模块',
      tagKind: 'plain',
      desc: '手术机器人相关的机构与控制模块：运动学建模、主从控制、精度验证实验的记录与拆解。',
      href: '#papers',
      foot: '机构 · 控制 · 实验'
    },
    {
      title: '读书笔记',
      tag: 'SOON',
      tagKind: 'soon',
      desc: '在读的书、划下来的句子、读完之后的几句话。还没开始，先占个位置。',
      href: '',
      foot: '待建'
    }
  ],

  /* 成果清单：file 填 assets/files/ 下的文件名，留空则显示「待上传」 */
  papers: [
    {
      title: '数学建模竞赛论文',
      project: '数学建模竞赛',
      year: '2026',
      kind: 'PDF',
      file: '',
      note: '赛题、模型与求解过程'
    },
    {
      title: '类脑强化学习训练框架 · 软件著作权',
      project: '类脑强化学习',
      year: '2026',
      kind: '软著',
      file: '',
      note: '登记证书扫描件'
    },
    {
      title: 'CT 协议 DSA 扫描路径规划系统',
      project: 'CT 路径规划',
      year: '',
      kind: '说明',
      file: '',
      note: '系统设计说明（整理中）'
    },
    {
      title: '手术机器人控制模块',
      project: '手术机器人',
      year: '',
      kind: '说明',
      file: '',
      note: '模块拆解与实验记录（整理中）'
    }
  ],

  // 关于：数组每项一段，**加粗** 会生效
  about: [
    '我不是程序员，只是个爱把东西整理清楚的人。这个站点先是给英语词汇做的一个阅读本，后来想，不如把它变成正经的主页。',
    '现在手上有四摊事：数学建模竞赛、类脑强化学习、CT 引导下的 DSA 扫描路径规划、手术机器人。名字听着散，做法其实一样——把一团乱的过程拆开、量化、再拼回去，然后写下来。',
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

    $('#paperList').innerHTML = (PROFILE.papers || []).map((p) => {
      const meta = [p.project, p.year, p.kind].filter(Boolean).join(' · ');
      const body =
        '<div class="paper-main">' +
        '<div class="paper-title">' + esc(p.title) + '</div>' +
        '<div class="paper-meta">' + esc(meta) + (p.note ? ' — ' + esc(p.note) : '') + '</div>' +
        '</div>';
      const badge = p.file
        ? '<span class="paper-badge">' + esc(p.kind || '文件') + ' ↓</span>'
        : '<span class="paper-badge pending">待上传</span>';
      return p.file
        ? '<li><a class="paper" href="assets/files/' + esc(p.file) + '" target="_blank" rel="noopener">' + body + badge + '</a></li>'
        : '<li><div class="paper">' + body + badge + '</div></li>';
    }).join('');

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
