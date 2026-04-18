// ==UserScript==
// @name           dl-librescore-shim
// @version        1.0.0
// @description    Runs the pinned dl-librescore bundle via Cu.Sandbox with GM API shims
// @author         DivitMittal
// ==/UserScript==

(function () {
  'use strict';

  // ── Load compiled bundle once at startup ──────────────────────────────────
  // Nix deploys the pinned .user.js alongside this shim; we read it once so
  // the observer callback stays fast.

  let scriptContent = null;

  (async () => {
    try {
      const scriptPath = PathUtils.join(
        Services.dirsvc.get('ProfD', Ci.nsIFile).path,
        'chrome', 'JS', 'dl-librescore.user.js'
      );
      scriptContent = await IOUtils.readUTF8(scriptPath);
    } catch (e) {
      console.error('[dl-librescore-shim] Failed to read bundle:', e);
    }
  })();

  // ── GM API shims ───────────────────────────────────────────────────────────
  // All functions close over chrome-context fetch(), so cross-origin requests
  // (musescore.com, wasabisys.com, etc.) are not subject to CORS.

  function makeGM(win) {
    const doc = win.document;
    return {
      info: {
        script: {
          version: 'nix-managed',
          homepage: 'https://github.com/LibreScore/dl-librescore',
        },
      },

      // Menu commands are a VM popup feature — no equivalent, silently ignore
      registerMenuCommand: () => Promise.resolve(0),

      addElement(tag, props) {
        const el = doc.createElement(tag);
        Object.assign(el, props);
        (doc.head ?? doc.documentElement).appendChild(el);
        return Promise.resolve(el);
      },

      openInTab(url) {
        Services.wm
          .getMostRecentWindow('navigator:browser')
          ?.openTrustedLinkIn(url, 'tab');
      },

      xmlHttpRequest({ method = 'GET', url, headers, data, responseType, onload, onerror } = {}) {
        const ctrl = new AbortController();
        // fetch() here is the chrome-privileged fetch — no CORS restrictions
        fetch(url, {
          method,
          headers,
          body: data || undefined,
          signal: ctrl.signal,
        })
          .then(async (res) => {
            let response;
            if      (responseType === 'arraybuffer') response = await res.arrayBuffer();
            else if (responseType === 'blob')        response = await res.blob();
            else if (responseType === 'json')        response = await res.json();
            else                                     response = await res.text();

            onload?.({
              readyState: 4,
              status: res.status,
              statusText: res.statusText,
              responseText: typeof response === 'string' ? response : '',
              response,
              finalUrl: res.url,
              responseHeaders: [...res.headers.entries()]
                .map(([k, v]) => `${k}: ${v}`)
                .join('\n'),
            });
          })
          .catch((err) => onerror?.({ error: err }));

        return { abort: () => ctrl.abort() };
      },
    };
  }

  // ── Sandbox injection ──────────────────────────────────────────────────────

  function inject(win) {
    if (!scriptContent) return;

    const sandbox = new Cu.Sandbox(win, {
      sandboxPrototype: win, // exposes DOM APIs (document, etc.)
      wantXrays: false,      // allows access to window.UGAPP set by page scripts
      sandboxName: 'dl-librescore',
    });

    sandbox.GM = makeGM(win);
    // unsafeWindow: script uses this to read window.UGAPP
    sandbox.unsafeWindow = win.wrappedJSObject ?? win;

    try {
      Cu.evalInSandbox(scriptContent, sandbox, 'latest', 'dl-librescore.user.js', 1);
    } catch (e) {
      console.error('[dl-librescore-shim] Execution error:', e);
    }
  }

  // ── Page detection (document-start equivalent) ────────────────────────────

  Services.obs.addObserver((subject) => {
    const win = subject;
    // Only top-level musescore.com pages; skip iframes/subframes
    if (win.top !== win) return;
    if (!/^https:\/\/(s\.)?musescore\.com\/.+\/.+/.test(win.location?.href ?? '')) return;
    inject(win);
  }, 'content-document-global-created', false);

})();
