// ==UserScript==
// @name           dl-librescore-shim
// @version        1.1.0
// @description    Runs the pinned dl-librescore bundle via Cu.Sandbox with GM API shims
// @author         DivitMittal
// ==/UserScript==

ChromeUtils.importESModule(
  "chrome://userscripts/content/web-content-actors.sys.mjs",
);
