/* 个人主页 — 渲染逻辑
   ─────────────────────────────────────────────
   只改下面的 PROFILE 就够了，其余不用动。
   ───────────────────────────────────────────── */

const PROFILE = {
  name: 'LGH',
  kicker: 'PERSONAL SITE',
  sub: '在读、在写、在记。这里放我做过的东西，和一些还在长出来的念头。',
  note: '最近在整理英语阅读的材料：每篇短文挑十来个词，配释义、搭配和易混点。',

  // 顶部的胶囊按钮
  links: [
    { label: 'GitHub', sub: '@l1g2h3', href: 'https://github.com/l1g2h3' },
    { label: '3D 城市', sub: 'beta', href: '../' },
    { label: '英语模块', sub: 'live', href: '../vocab/' },
    { label: '邮件', sub: '298137856@qq.com', href: 'mailto:298137856@qq.com' }
  ],

  // 模块卡片：tagKind 用 'live' 表示上线，'soon' 表示在建，'plain' 表示资料类
  modules: [
    {
      title: '英语模块',
      tag: 'LIVE',
      tagKind: 'live',
      desc: '按领域分组的短文阅读，点词看释义、搭配与易混辨析；划词收进生词本，复习页做翻牌自测。支持多设备云同步。',
      href: '../vocab/',
      foot: 'HTML · 无构建 · 数据存 GitHub Gist'
    },
    {
      title: '数学建模竞赛',
      tag: '论文',
      tagKind: 'plain',
      desc: '2025 到 2026 的国赛、美赛与校赛论文，六篇完整归档，可直接下载 PDF。',
      href: 'work/?m=modeling',
      foot: '6 篇论文 · LaTeX'
    },
    {
      title: '类脑强化学习',
      tag: '软著',
      tagKind: 'plain',
      desc: 'PPO 与自注意力机制结合的 Pong 智能体，附软件著作权登记证书与说明书。',
      href: 'work/?m=rl',
      foot: 'PPO · Self-Attention · 软著'
    },
    {
      title: 'CT 协议 DSA 路径规划',
      tag: '系统',
      tagKind: 'plain',
      desc: '低剂量介入下的 CT-DSA 虚实联动路径仿真与智能寻角控制：血管分割、入路约束、角度优化。',
      href: 'work/?m=dsa',
      foot: '论文 · 海报 · 仿真视频'
    },
    {
      title: '智能车',
      tag: '作品',
      tagKind: 'plain',
      desc: '摄像头循迹的履带小车：二值化找线、中线提取、PID 打角。整车照片与运行视频。',
      href: 'work/?m=car',
      foot: '履带底盘 · 摄像头 · PID'
    },
    {
      title: '一些有趣的实验',
      tag: '动手',
      tagKind: 'plain',
      desc: '3D 打印、激光雕刻、光固化——不务正业但很有用的那种。十张记录。',
      href: 'work/?m=lab',
      foot: 'PLA · 椴木 · 光敏树脂'
    },
    {
      title: '课程相关',
      tag: '课程',
      tagKind: 'soon',
      desc: '课程作业、实验报告和笔记，还在整理。',
      href: 'work/?m=course',
      foot: '整理中'
    },
    {
      title: '手术机器人',
      tag: '模块',
      tagKind: 'soon',
      desc: '机构与控制模块：运动学建模、主从控制、精度验证实验的记录与拆解。',
      href: 'work/?m=surgery',
      foot: '整理中'
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

  /* 成果清单：href 指向项目页；没有 href 就显示「待上传」 */
  papers: [
    {
      title: '数学建模竞赛 · 六篇论文',
      project: '数学建模竞赛',
      year: '2025 — 2026',
      kind: 'PDF',
      href: 'work/?m=modeling',
      note: '国赛 / 美赛 / 校赛'
    },
    {
      title: '基于 PPO 与自注意力机制的 Pong 智能体',
      project: '类脑强化学习',
      year: '2026',
      kind: '软著',
      href: 'work/?m=rl',
      note: '登记号 2026SR0601239'
    },
    {
      title: 'CT-DSA 虚实联动路径仿真与智能寻角控制',
      project: 'CT 路径规划',
      year: '2026',
      kind: '论文',
      href: 'work/?m=dsa',
      note: '论文 · 获奖证书 · 仿真视频'
    },
    {
      title: '摄像头循迹智能车',
      project: '智能车',
      year: '2026',
      kind: '作品',
      href: 'work/?m=car',
      note: '整车照片与运行视频'
    },
    {
      title: '3D 打印与激光雕刻记录',
      project: '一些有趣的实验',
      year: '2025 — 2026',
      kind: '记录',
      href: 'work/?m=lab',
      note: '十张照片'
    }
  ],

  // 关于：数组每项一段，**加粗** 会生效
  about: [
    '我不是程序员，只是个爱把东西整理清楚的人。这个站点先是给英语词汇做的一个阅读本，后来想，不如把它变成正经的主页。',
    '现在手上有几摊事：数学建模、类脑强化学习、CT 引导下的 DSA 路径规划、手术机器人，还有智能车和一堆动手实验。名字听着散，做法其实一样——把一团乱的过程拆开、量化、再拼回去，然后写下来。',
    '做这些东西的原则很简单：**能离线就离线，能不加依赖就不加**。所以整个站点是几个静态文件，没有框架、没有构建步骤，改一行就能看到变化。',
    '主页是一整座城市，每加一个模块就多一栋楼。几年后这里大概会变成一片真的街区。'
  ],

  contacts: [
    { label: 'GitHub', value: 'github.com/l1g2h3', href: 'https://github.com/l1g2h3' },
    { label: '邮箱', value: '298137856@qq.com', href: 'mailto:298137856@qq.com' },
    { label: '英语模块', value: 'l1g2h3.github.io/vocab/', href: '../vocab/' }
  ]
};

/* ───────────── 以下不用改 ───────────── */

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
      const href = p.href || (p.file ? 'assets/files/' + p.file : '');
      const badge = href
        ? '<span class="paper-badge">' + esc(p.kind || '查看') + ' ↗</span>'
        : '<span class="paper-badge pending">待上传</span>';
      return href
        ? '<li><a class="paper" href="' + esc(href) + '">' + body + badge + '</a></li>'
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
