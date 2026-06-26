import { GithubPrActionsPanel } from "./GithubPrActionsPanel.sys.mjs";

export class GithubPrActionsChild extends JSWindowActorChild {
  constructor() {
    super();
    this.navigationListenersAttached = false;
    this.panel = new GithubPrActionsPanel(this);
  }

  handleEvent(event) {
    if (event.type !== "DOMContentLoaded") {
      return;
    }

    const win = this.contentWindow;
    if (
      !win ||
      win.top !== win ||
      !this.document.location?.hostname.endsWith("github.com")
    ) {
      return;
    }

    if (!this.navigationListenersAttached) {
      this.navigationListenersAttached = true;
      for (const eventName of ["turbo:load", "turbo:render", "pjax:end"]) {
        this.document.addEventListener(eventName, () => this.panel.reinject());
      }
    }

    this.panel
      .inject()
      .catch((error) =>
        console.error("[github-pr-actions] inject failed", error),
      );
  }
}
