const Cu = Components.utils;

function isScorePage(href) {
  return /^https:\/\/(s\.)?musescore\.com\/.+\/.+/.test(href ?? "");
}

export class DlLibrescoreShimChild extends JSWindowActorChild {
  constructor() {
    super();
    this.bundlePromise = null;
    this.injectedUrls = new Set();
  }

  loadBundle() {
    this.bundlePromise ??= fetch(
      "chrome://userscripts/content/dl-librescore.user.js",
    ).then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to read dl-librescore.user.js: HTTP ${response.status}`,
        );
      }
      return response.text();
    });
    return this.bundlePromise;
  }

  makeGM(win) {
    const doc = win.document;
    return {
      info: {
        script: {
          version: "nix-managed",
          homepage: "https://github.com/LibreScore/dl-librescore",
        },
      },

      registerMenuCommand: () => Promise.resolve(0),

      addElement(tag, props) {
        const el = doc.createElement(tag);
        Object.assign(el, props);
        (doc.head ?? doc.documentElement).appendChild(el);
        return Promise.resolve(el);
      },

      openInTab: (url) => this.sendAsyncMessage("gm:openInTab", { url }),

      xmlHttpRequest: ({
        method = "GET",
        url,
        headers,
        data,
        responseType,
        onload,
        onerror,
      } = {}) => {
        let aborted = false;
        this.sendQuery("gm:xmlHttpRequest", {
          method,
          url,
          headers,
          data,
          responseType,
        })
          .then((result) => {
            if (aborted) {
              return;
            }
            if (
              responseType === "blob" &&
              result.response instanceof ArrayBuffer
            ) {
              result.response = new win.Blob([result.response]);
            }
            onload?.(result);
          })
          .catch((error) => {
            if (!aborted) {
              onerror?.({ error });
            }
          });

        return {
          abort: () => {
            aborted = true;
          },
        };
      },
    };
  }

  async inject(win) {
    const href = win.document.location?.href ?? "";
    if (this.injectedUrls.has(href)) {
      return;
    }
    this.injectedUrls.add(href);

    const scriptContent = await this.loadBundle();
    const sandbox = new Cu.Sandbox(win, {
      sandboxPrototype: win,
      wantXrays: false,
      sandboxName: "dl-librescore",
    });
    const gm = this.makeGM(win);

    sandbox.GM = gm;
    sandbox.GM_info = gm.info;
    sandbox.GM_addElement = gm.addElement;
    sandbox.GM_openInTab = gm.openInTab;
    sandbox.GM_registerMenuCommand = gm.registerMenuCommand;
    sandbox.GM_xmlhttpRequest = gm.xmlHttpRequest;
    sandbox.unsafeWindow = Cu.waiveXrays(win);

    Cu.evalInSandbox(
      scriptContent,
      sandbox,
      "latest",
      "dl-librescore.user.js",
      1,
    );
  }

  handleEvent(event) {
    if (event.type !== "DOMContentLoaded") {
      return;
    }

    const win = this.contentWindow;
    if (!win || win.top !== win || !isScorePage(this.document.location?.href)) {
      return;
    }

    this.inject(win).catch((error) =>
      console.error("[dl-librescore-shim] inject failed", error),
    );
  }
}
