// ==UserScript==
// @name           github-pr-actions
// @version        1.1.0
// @description    One-click: assign self, approve, merge or squash-merge PRs
// @author         DivitMittal
// ==/UserScript==

(function () {
  'use strict';

  const GITHUB_USER = 'DivitMittal';
  const PREF_TOKEN  = 'extensions.github-pr-actions.token';

  // ── Token storage via Services.prefs (persists in prefs.js) ───────────────

  const tok = {
    get:   ()    => { try { return Services.prefs.getStringPref(PREF_TOKEN, ''); } catch { return ''; } },
    set:   (val) => Services.prefs.setStringPref(PREF_TOKEN, val),
    clear: ()    => { try { Services.prefs.clearUserPref(PREF_TOKEN); } catch {} },
  };

  // ── URL parsing ────────────────────────────────────────────────────────────

  function parsePRUrl(href) {
    const m = href?.match(/github\.com\/([^/?#]+)\/([^/?#]+)\/pull\/(\d+)/);
    return m ? { owner: m[1], repo: m[2], number: m[3] } : null;
  }

  // ── API (fetch in chrome context = no CORS restrictions) ──────────────────

  async function api(method, path, body) {
    const t = tok.get();
    if (!t) throw new Error('No token stored');
    const res = await fetch(`https://api.github.com${path}`, {
      method,
      headers: {
        Authorization: `token ${t}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
    return data;
  }

  // ── Button state helpers ───────────────────────────────────────────────────

  function setLoading(btn, text = '…') {
    btn.disabled = true;
    btn.dataset.orig = btn.textContent;
    btn.textContent = text;
    btn.style.opacity = '0.6';
  }

  function setDone(btn, text) {
    btn.textContent = text;
    btn.style.background = '#2ea043';
    btn.style.opacity = '1';
  }

  function setErr(btn, msg) {
    btn.disabled = false;
    btn.textContent = btn.dataset.orig;
    btn.style.opacity = '1';
    btn.title = msg;
    btn.style.background = '#da3633';
    setTimeout(() => { btn.style.background = ''; btn.title = ''; }, 3000);
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async function assignSelf(btn, pr) {
    setLoading(btn);
    try {
      await api('POST', `/repos/${pr.owner}/${pr.repo}/issues/${pr.number}/assignees`, { assignees: [GITHUB_USER] });
      setDone(btn, 'Assigned ✓');
    } catch (e) { setErr(btn, e.message); }
  }

  async function approvePR(btn, pr) {
    setLoading(btn);
    try {
      await api('POST', `/repos/${pr.owner}/${pr.repo}/pulls/${pr.number}/reviews`, { event: 'APPROVE' });
      setDone(btn, 'Approved ✓');
    } catch (e) { setErr(btn, e.message); }
  }

  async function mergePR(btn, pr, method) {
    setLoading(btn);
    try {
      await api('PUT', `/repos/${pr.owner}/${pr.repo}/pulls/${pr.number}/merge`, { merge_method: method });
      setDone(btn, method === 'squash' ? 'Squashed ✓' : 'Merged ✓');
    } catch (e) { setErr(btn, e.message); }
  }

  async function doAll(btn, pr) {
    try {
      setLoading(btn, 'Assigning…');
      await api('POST', `/repos/${pr.owner}/${pr.repo}/issues/${pr.number}/assignees`, { assignees: [GITHUB_USER] });
      btn.textContent = 'Approving…';
      await api('POST', `/repos/${pr.owner}/${pr.repo}/pulls/${pr.number}/reviews`, { event: 'APPROVE' });
      btn.textContent = 'Merging…';
      await api('PUT', `/repos/${pr.owner}/${pr.repo}/pulls/${pr.number}/merge`, { merge_method: 'squash' });
      setDone(btn, 'Done ✓');
    } catch (e) { setErr(btn, e.message); }
  }

  // ── UI helpers ─────────────────────────────────────────────────────────────

  function mkBtn(doc, label, color, onClick) {
    const btn = doc.createElement('button');
    btn.textContent = label;
    Object.assign(btn.style, {
      background: color,
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      padding: '6px 12px',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      transition: 'opacity 0.15s, background 0.15s',
      whiteSpace: 'nowrap',
    });
    btn.addEventListener('mouseenter', () => { if (!btn.disabled) btn.style.opacity = '0.85'; });
    btn.addEventListener('mouseleave', () => { btn.style.opacity = '1'; });
    btn.addEventListener('click', onClick);
    return btn;
  }

  // ── Panel contents ─────────────────────────────────────────────────────────

  function buildTokenForm(doc, panel, pr) {
    const msg = doc.createElement('div');
    msg.textContent = 'PAT with repo scope:';
    Object.assign(msg.style, {
      color: '#8b949e',
      fontSize: '11px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    });

    const input = doc.createElement('input');
    input.type = 'password';
    input.placeholder = 'ghp_…';
    Object.assign(input.style, {
      background: '#0d1117',
      color: '#e6edf3',
      border: '1px solid #30363d',
      borderRadius: '6px',
      padding: '5px 8px',
      fontSize: '12px',
      width: '100%',
      boxSizing: 'border-box',
      fontFamily: 'monospace',
    });

    const saveBtn = mkBtn(doc, 'Save token', '#1f6feb', () => {
      const val = input.value.trim();
      if (!val) return;
      tok.set(val);
      panel.innerHTML = '';
      buildActionButtons(doc, panel, pr);
    });

    [msg, input, saveBtn].forEach(el => panel.appendChild(el));
    // Focus the input after a tick so the panel is in the DOM
    setTimeout(() => input.focus(), 50);
  }

  function buildActionButtons(doc, panel, pr) {
    const heading = doc.createElement('div');
    heading.textContent = 'Quick Actions';
    Object.assign(heading.style, {
      color: '#8b949e',
      fontSize: '11px',
      fontWeight: '600',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '2px',
    });

    const divider = doc.createElement('hr');
    Object.assign(divider.style, { border: 'none', borderTop: '1px solid #30363d', margin: '2px 0' });

    const btnDoAll  = mkBtn(doc, '⚡ Assign + Approve + Squash merge', '#6e40c9', () => doAll(btnDoAll, pr));
    const btnAssign = mkBtn(doc, 'Assign me',      '#1f6feb', () => assignSelf(btnAssign, pr));
    const btnApprove= mkBtn(doc, 'Approve',        '#388bfd', () => approvePR(btnApprove, pr));
    const btnMerge  = mkBtn(doc, 'Merge',          '#2ea043', () => mergePR(btnMerge, pr, 'merge'));
    const btnSquash = mkBtn(doc, 'Squash & merge', '#2ea043', () => mergePR(btnSquash, pr, 'squash'));

    const resetLink = doc.createElement('a');
    resetLink.textContent = 'Reset token';
    Object.assign(resetLink.style, {
      color: '#8b949e',
      fontSize: '10px',
      textAlign: 'center',
      cursor: 'pointer',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      marginTop: '4px',
    });
    resetLink.addEventListener('click', () => {
      tok.clear();
      panel.innerHTML = '';
      buildTokenForm(doc, panel, pr);
    });

    [heading, btnDoAll, divider, btnAssign, btnApprove, btnMerge, btnSquash, resetLink]
      .forEach(el => panel.appendChild(el));
  }

  // ── Panel lifecycle ────────────────────────────────────────────────────────

  function injectPanel(doc) {
    if (doc.getElementById('gh-quick-actions')) return;
    const pr = parsePRUrl(doc.location?.href);
    if (!pr) return;

    const panel = doc.createElement('div');
    panel.id = 'gh-quick-actions';
    Object.assign(panel.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: '9999',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '12px',
      background: '#161b22',
      border: '1px solid #30363d',
      borderRadius: '10px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    });

    if (tok.get()) {
      buildActionButtons(doc, panel, pr);
    } else {
      buildTokenForm(doc, panel, pr);
    }

    doc.body.appendChild(panel);
  }

  function reinject(doc) {
    doc.getElementById('gh-quick-actions')?.remove();
    injectPanel(doc);
  }

  // ── Page detection ─────────────────────────────────────────────────────────

  function onDocLoad(doc) {
    if (!doc?.location?.href?.match(/github\.com\/[^/?#]+\/[^/?#]+\/pull\/\d+/)) return;
    injectPanel(doc);
    // GitHub uses Turbo (and legacy pjax) for soft navigation — no DOMContentLoaded fires
    doc.addEventListener('turbo:load',   () => reinject(doc));
    doc.addEventListener('turbo:render', () => reinject(doc));
    doc.addEventListener('pjax:end',     () => reinject(doc));
  }

  gBrowser.addEventListener('DOMContentLoaded', (e) => onDocLoad(e.target), true);

})();
