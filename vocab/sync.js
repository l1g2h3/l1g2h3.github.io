/* =========================================================
   六級词汇阅读本 — 云同步（GitHub Gist）
   ---------------------------------------------------------
   为什么是 Gist：站点是纯静态的，没有后端。Gist 是 GitHub 提供的
   小型键值存储，免费、有 CORS、不需要服务器。数据存在你自己的
   一个 secret gist 里，除了你和 GitHub 谁也看不到。

   同步策略：拉取 → 按条目合并 → 推送。
   每条记录（标记、生词、批次）都带时间戳，删除带墓碑，所以
   两台设备的改动不会互相覆盖，只同步较新的一次。

   合并逻辑是纯函数 mergeState()，node 里可直接测。
   ========================================================= */
(function (root) {
  'use strict';

  var KEYS = {
    prefs: 'cet6.prefs.v1',
    flags: 'cet6.flags.v1',
    extra: 'cet6.extra.v1',
    notebook: 'cet6.notebook.v1'
  };
  var CFG_KEY = 'cet6.sync.cfg.v1';
  var STAMP_KEY = 'cet6.sync.stamp.v1';
  var GIST_FILE = 'cet6-sync.json';
  var GIST_DESC = 'cet6-reader sync (auto-generated)';
  var API = 'https://api.github.com';

  var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
  var nativeSet = null;

  /* ---------------- 纯逻辑：合并 ---------------- */
  function lower(s) { return String(s == null ? '' : s).toLowerCase(); }

  function pick(lt, rt) { return rt > lt ? 'remote' : 'local'; }

  /* 逐条目合并：两边的值 + 各自时间戳 + 墓碑 */
  function mergeCollection(lv, lat, rv, rat, ltm, rtm, outAt, outTomb) {
    var out = {};
    var keys = {};
    Object.keys(lv || {}).forEach(function (k) { keys[k] = 1; });
    Object.keys(rv || {}).forEach(function (k) { keys[k] = 1; });

    Object.keys(keys).forEach(function (k) {
      var lt = lat[k] || 0;
      var rt = rat[k] || 0;
      var tomb = Math.max(ltm[k] || 0, rtm[k] || 0);
      var side = pick(lt, rt);
      var val = side === 'remote' ? rv[k] : lv[k];
      var ts = Math.max(lt, rt);

      if (val === undefined) return;
      if (tomb > ts) { outTomb[k] = tomb; return; }   // 先删后加才留，先加后删就删掉
      out[k] = val;
      outAt[k] = ts;
      if (tomb) outTomb[k] = tomb;
    });
    return out;
  }

  /* 生词本/批次是数组，按 term / id 建索引后复用上面的逐条合并 */
  function indexBy(arr, keyOf) {
    var map = {};
    (arr || []).forEach(function (it) {
      if (!it) return;
      var k = lower(keyOf(it));
      if (!k) return;
      map[k] = it;
    });
    return map;
  }

  /**
   * 合并本地与远端两个同步载荷。
   * payload 结构：{ flags, flagsAt, notebook, notebookAt, extra, extraAt, tomb:{flags,notebook,extra}, savedAt }
   */
  function mergeState(local, remote) {
    local = local || {};
    remote = remote || {};
    var lt = (local.tomb) || {};
    var rt = (remote.tomb) || {};
    var out = { v: 1, savedAt: Date.now(), flagsAt: {}, notebookAt: {}, extraAt: {}, tomb: { flags: {}, notebook: {}, extra: {} } };

    out.flags = mergeCollection(
      local.flags || {}, local.flagsAt || {}, remote.flags || {}, remote.flagsAt || {},
      lt.flags || {}, rt.flags || {}, out.flagsAt, out.tomb.flags
    );

    out.notebook = mergeArray(
      local.notebook || [], local.notebookAt || {},
      remote.notebook || [], remote.notebookAt || {},
      function (n) { return lower(n.term); },
      lt.notebook || {}, rt.notebook || {}, out.notebookAt, out.tomb.notebook
    );

    out.extra = mergeArray(
      local.extra || [], local.extraAt || {},
      remote.extra || [], remote.extraAt || {},
      function (b) { return lower(b.id); },
      lt.extra || {}, rt.extra || {}, out.extraAt, out.tomb.extra
    );

    return out;
  }

  function mergeArray(larr, lat, rarr, rat, keyOf, ltm, rtm, outAt, outTomb) {
    var lv = indexBy(larr, keyOf);
    var rv = indexBy(rarr, keyOf);
    var merged = mergeCollection(lv, lat, rv, rat, ltm, rtm, outAt, outTomb);
    var out = [];
    Object.keys(merged).forEach(function (k) { out.push(merged[k]); });
    return out;
  }

  /* ---------------- 浏览器端 ---------------- */
  function LSget(k, fb) {
    try { var r = localStorage.getItem(k); return r == null ? fb : JSON.parse(r); }
    catch (e) { return fb; }
  }
  function LSset(k, v) {
    try { (nativeSet || localStorage.setItem).call(localStorage, k, JSON.stringify(v)); }
    catch (e) { /* 无痕模式 */ }
  }

  function cfg() {
    return Object.assign(
      { token: '', gistId: '', login: '', device: '', lastAt: 0, lastError: '' },
      LSget(CFG_KEY, {})
    );
  }
  function saveCfg(c) { LSset(CFG_KEY, c); }
  function stamps() {
    return Object.assign(
      { flags: {}, notebook: {}, extra: {}, tomb: { flags: {}, notebook: {}, extra: {} } },
      LSget(STAMP_KEY, {})
    );
  }
  function saveStamps(s) { LSset(STAMP_KEY, s); }

  /* 记录“某条被改过”的时间，删除留墓碑 */
  function stampChange(key, oldRaw, newRaw) {
    if (key !== KEYS.flags && key !== KEYS.notebook && key !== KEYS.extra) return false;
    var now = Date.now();
    var s = stamps();
    var changed = false;

    function bump(bucket, tomb, k) {
      s[bucket][k] = now;
      if (s.tomb[tomb][k]) delete s.tomb[tomb][k];
      changed = true;
    }
    function bury(tomb, bucket, k) {
      s.tomb[tomb][k] = now;
      if (s[bucket][k]) delete s[bucket][k];
      changed = true;
    }

    var oldV, newV;
    try { oldV = oldRaw ? JSON.parse(oldRaw) : null; } catch (e) { oldV = null; }
    try { newV = newRaw ? JSON.parse(newRaw) : null; } catch (e) { newV = null; }

    if (key === KEYS.flags) {
      var of = oldV || {}, nf = newV || {};
      Object.keys(nf).forEach(function (k) { if (of[k] !== nf[k]) bump('flags', 'flags', k); });
      Object.keys(of).forEach(function (k) { if (!(k in nf)) bury('flags', 'flags', k); });
    } else {
      var bucket = key === KEYS.notebook ? 'notebook' : 'extra';
      var keyOf = function (it) { return lower(bucket === 'notebook' ? it.term : it.id); };
      var oi = indexBy(oldV || [], keyOf), ni = indexBy(newV || [], keyOf);
      Object.keys(ni).forEach(function (k) {
        if (!oi[k] || JSON.stringify(oi[k]) !== JSON.stringify(ni[k])) bump(bucket, bucket, k);
      });
      Object.keys(oi).forEach(function (k) { if (!ni[k]) bury(bucket, bucket, k); });
    }

    if (changed) saveStamps(s);
    return changed;
  }

  /* 拦截 localStorage 写入：既打时间戳，也触发自动上传 */
  function installWatcher() {
    if (!isBrowser || !root.localStorage) return;
    nativeSet = root.localStorage.setItem;
    try {
      root.localStorage.setItem = function (k, v) {
        var changed = false;
        try { if (!suppress) changed = stampChange(k, this.getItem(k), v); } catch (e) { changed = false; }
        var r = nativeSet.call(this, k, v);
        if (changed) scheduleUpload();
        return r;
      };
    } catch (e) { /* 某些浏览器不允许改写，退化为手动同步 */ }
  }

  /* 把内存里的状态组装成载荷 */
  function localPayload(getState) {
    var st = getState ? getState() : {};
    var s = stamps();
    return {
      v: 1,
      savedAt: Date.now(),
      device: cfg().device,
      flags: st.flags || {},
      flagsAt: s.flags || {},
      notebook: st.notebook || [],
      notebookAt: s.notebook || {},
      extra: st.extra || [],
      extraAt: s.extra || {},
      tomb: s.tomb || { flags: {}, notebook: {}, extra: {} }
    };
  }

  /* ---------------- GitHub API ---------------- */
  function api(token, method, path, body) {
    return fetch(API + path, {
      method: method,
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      return r.text().then(function (t) {
        var d = null;
        try { d = t ? JSON.parse(t) : null; } catch (e) { d = t; }
        if (!r.ok) {
          var err = new Error('HTTP ' + r.status + (d && d.message ? '：' + d.message : ''));
          err.status = r.status;
          throw err;
        }
        return d;
      });
    });
  }

  function findGist(token) {
    return api(token, 'GET', '/gists?per_page=100').then(function (list) {
      var hit = (list || []).filter(function (g) {
        return g && g.files && g.files[GIST_FILE] && g.description === GIST_DESC;
      })[0];
      return hit ? hit.id : '';
    });
  }

  function ensureGist(token, state) {
    var c = cfg();
    var done = function (id) { c.gistId = id; saveCfg(c); return id; };

    if (c.gistId) {
      return api(token, 'GET', '/gists/' + c.gistId).then(function () { return c.gistId; })
        .catch(function (e) {
          if (e.status !== 404) throw e;
          c.gistId = '';
          return createGist(token, state);
        });
    }
    return findGist(token).then(function (id) {
      if (id) return done(id);
      return createGist(token, state);
    });
  }

  function createGist(token, state) {
    var files = {};
    files[GIST_FILE] = { content: JSON.stringify(state, null, 1) };
    return api(token, 'POST', '/gists', { description: GIST_DESC, public: false, files: files })
      .then(function (g) {
        var c = cfg();
        c.gistId = g.id;
        saveCfg(c);
        return g.id;
      });
  }

  function readGist(token, id) {
    return api(token, 'GET', '/gists/' + id).then(function (g) {
      var f = g.files && g.files[GIST_FILE];
      if (!f) return null;
      if (!f.truncated && f.content) { try { return JSON.parse(f.content); } catch (e) { return null; } }
      var url = f.raw_url;
      if (!url) return null;
      return fetch(url, { cache: 'no-store' }).then(function (r) { return r.text(); })
        .then(function (t) { try { return JSON.parse(t); } catch (e) { return null; } });
    });
  }

  function writeGist(token, id, state) {
    var files = {};
    files[GIST_FILE] = { content: JSON.stringify(state, null, 1) };
    return api(token, 'PATCH', '/gists/' + id, { files: files, description: GIST_DESC });
  }

  /* ---------------- 对外接口 ---------------- */
  var handlers = { getState: null, applyState: null, notify: null };
  var busy = false;
  var suppress = false;   // 回写远端结果时不打时间戳，避免把远端数据算成本地新改动
  var pending = false;
  var upTimer = null;
  var UI = null;

  function notify(msg, kind) { if (handlers.notify) handlers.notify(msg, kind || 'info'); }

  function syncNow(silent) {
    var c = cfg();
    if (!c.token) return Promise.resolve({ ok: false, reason: 'no-token' });
    if (busy) { pending = true; return Promise.resolve({ ok: false, reason: 'busy' }); }
    busy = true;
    renderUI('同步中…');

    var local = localPayload(handlers.getState);
    var token = c.token;

    return ensureGist(token, local)
      .then(function (id) {
        return readGist(token, id).then(function (remote) {
          var merged = mergeState(local, remote || {});
          var stats = {
            flags: Object.keys(merged.flags || {}).length,
            notebook: (merged.notebook || []).length,
            extra: (merged.extra || []).length
          };
          var remoteChanged = !remote || JSON.stringify(remote) !== JSON.stringify(merged);
          return (remoteChanged ? writeGist(token, id, merged) : Promise.resolve())
            .then(function () {
              if (handlers.applyState) handlers.applyState(merged);
              var cc = cfg();
              cc.lastAt = Date.now();
              cc.lastError = '';
              saveCfg(cc);
              if (!silent) notify('同步完成 · 标记 ' + stats.flags + ' · 生词 ' + stats.notebook, 'ok');
              renderUI('已同步');
              return { ok: true, stats: stats };
            });
        });
      })
      .catch(function (e) {
        var cc = cfg();
        cc.lastError = e.message || String(e);
        saveCfg(cc);
        if (e.status === 401) {
          notify('令牌无效或已过期，请重新生成并填入', 'err');
        } else if (e.status === 403) {
          notify('GitHub 拒绝了请求（可能是配额或权限不足）', 'err');
        } else if (!silent) {
          notify('同步失败：' + cc.lastError, 'err');
        }
        renderUI('同步失败');
        return { ok: false, reason: cc.lastError };
      })
      .then(function (r) {
        busy = false;
        if (pending) { pending = false; setTimeout(function () { syncNow(true); }, 800); }
        return r;
      });
  }

  function scheduleUpload() {
    var c = cfg();
    if (!c.token) return;
    clearTimeout(upTimer);
    upTimer = setTimeout(function () { syncNow(true); }, 9000);
  }

  function connect(token) {
    token = String(token || '').trim();
    if (!token) { notify('先填入令牌', 'err'); return Promise.resolve(false); }
    renderUI('验证令牌…');
    return api(token, 'GET', '/user')
      .then(function (u) {
        var c = cfg();
        c.token = token;
        c.login = u.login;
        c.lastError = '';
        if (!c.device) c.device = 'web-' + Math.random().toString(36).slice(2, 7);
        saveCfg(c);
        notify('已连接 ' + u.login + '，正在首次同步');
        return syncNow(true).then(function (r) {
          renderUI('');
          return !!r.ok;
        });
      })
      .catch(function (e) {
        notify(e.status === 401 ? '令牌无效，请检查是否勾选了 gist 权限' : '连接失败：' + e.message, 'err');
        renderUI('');
        return false;
      });
  }

  function disconnect() {
    var c = cfg();
    c.token = '';
    c.gistId = '';
    c.login = '';
    c.lastError = '';
    saveCfg(c);
    renderUI('');
    notify('已断开，云端数据仍保留在你的 Gist 里');
  }

  function relTime(ts) {
    if (!ts) return '从未';
    var d = Date.now() - ts;
    if (d < 60000) return '刚刚';
    if (d < 3600000) return Math.floor(d / 60000) + ' 分钟前';
    if (d < 86400000) return Math.floor(d / 3600000) + ' 小时前';
    return Math.floor(d / 86400000) + ' 天前';
  }

  function renderUI(status) {
    if (!UI) return;
    var c = cfg();
    var st = status || (busy ? '同步中…' : '');
    UI.innerHTML =
      '<h3>云同步</h3>' +
      '<p class="hint">标记、生词本、导入的批次在设备之间同步。数据存在你自己的一个 secret gist 里，' +
      '除你和 GitHub 之外没人能看。外观设置不同步，每台设备各自保留。</p>' +
      (c.token
        ? '<div class="row"><label>状态</label><b>' +
          (c.lastError ? '<span style="color:var(--new)">' + esc(c.lastError) + '</span>' : '已连接 ' + esc(c.login || '')) +
          '</b></div>' +
          '<div class="row"><label>上次同步</label><b>' + relTime(c.lastAt) + '</b></div>' +
          '<div class="row"><label>操作</label><div class="stack">' +
          '<button class="btn btn-primary" data-sync="now">' + (st || '立即同步') + '</button>' +
          '<button class="btn" data-sync="off">断开</button>' +
          '</div></div>'
        : '<div class="sync-form">' +
          '<label for="syncToken">访问令牌</label>' +
          '<input id="syncToken" type="password" spellcheck="false" autocomplete="off" placeholder="ghp_… 只勾选 gist 权限">' +
          '<button class="btn btn-primary" data-sync="on">连接并同步</button>' +
          '</div>' +
          '<p class="hint">去 <a href="https://github.com/settings/tokens/new?scopes=gist&description=cet6-sync" target="_blank" rel="noopener" style="border-bottom:1px solid var(--line)">github.com/settings/tokens</a> 生成一个 classic token，只勾 <code>gist</code> 一项。令牌只存在本机浏览器里，换设备需要再贴一次。</p>');
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  function mount(el, h) {
    UI = el;
    if (h) handlers = Object.assign(handlers, h);
    if (!el) return;
    renderUI('');
    el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sync]');
      if (!b) return;
      var act = b.dataset.sync;
      if (act === 'on') {
        var input = el.querySelector('#syncToken');
        connect(input ? input.value : '');
      } else if (act === 'now') {
        syncNow(false).then(function () { renderUI(''); });
      } else if (act === 'off') {
        disconnect();
      }
    });
  }

  function bind(h) { handlers = Object.assign(handlers, h); }

  function init() {
    if (!isBrowser) return;
    var c = cfg();
    if (!c.device) { c.device = 'web-' + Math.random().toString(36).slice(2, 7); saveCfg(c); }
    installWatcher();
    if (c.token) setTimeout(function () { syncNow(true); }, 1200);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState !== 'visible') return;
      var cc = cfg();
      if (cc.token && Date.now() - cc.lastAt > 60000) syncNow(true);
    });
    if ('storage' in root) {
      root.addEventListener('storage', function (e) {
        if (e.key === KEYS.flags || e.key === KEYS.notebook || e.key === KEYS.extra) scheduleUpload();
      });
    }
  }

  var CET6Sync = {
    mergeState: mergeState,
    localPayload: localPayload,
    bind: bind,
    mount: mount,
    init: init,
    connect: connect,
    disconnect: disconnect,
    syncNow: syncNow,
    config: cfg,
    stamps: stamps,
    suppressWhile: function (fn) {
      suppress = true;
      try { return fn(); } finally { suppress = false; }
    }
  };

  root.CET6Sync = CET6Sync;
  if (isBrowser) init();

  /* node 下单测用 */
  if (typeof module !== 'undefined' && module.exports) module.exports = { mergeState: mergeState };
})(typeof globalThis !== 'undefined' ? globalThis : this);
