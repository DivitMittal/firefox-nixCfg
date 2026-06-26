const WEB_REMOTE_TYPES = ["web", "webIsolated"];

function registerActor(name, matches) {
  ChromeUtils.registerWindowActor(name, {
    parent: {
      esModuleURI: `chrome://userscripts/content/${name}/${name}Parent.sys.mjs`,
    },
    child: {
      esModuleURI: `chrome://userscripts/content/${name}/${name}Child.sys.mjs`,
      events: {
        DOMContentLoaded: {},
      },
    },
    matches,
    remoteTypes: WEB_REMOTE_TYPES,
    safeForUntrustedWebProcess: true,
  });
}

registerActor("GithubPrActions", ["https://github.com/*"]);
registerActor("DlLibrescoreShim", [
  "https://musescore.com/*",
  "https://s.musescore.com/*",
]);
