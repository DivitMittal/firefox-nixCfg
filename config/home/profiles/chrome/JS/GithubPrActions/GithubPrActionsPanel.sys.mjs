import {
  mkBtn,
  setDone,
  setErr,
  setLoading,
} from "./GithubPrActionsElements.sys.mjs";

const GITHUB_USER = "DivitMittal";

function parsePRUrl(href) {
  const match = href?.match(/github\.com\/([^/?#]+)\/([^/?#]+)\/pull\/(\d+)/);
  return match ? { owner: match[1], repo: match[2], number: match[3] } : null;
}

export class GithubPrActionsPanel {
  constructor(actor) {
    this.actor = actor;
  }

  sendQuery(name, data) {
    return this.actor.sendQuery(name, data);
  }

  api(method, path, body) {
    return this.sendQuery("github:api", { method, path, body });
  }

  async assignSelf(btn, pr) {
    setLoading(btn);
    try {
      await this.api(
        "POST",
        `/repos/${pr.owner}/${pr.repo}/issues/${pr.number}/assignees`,
        {
          assignees: [GITHUB_USER],
        },
      );
      setDone(btn, "Assigned ✓");
    } catch (error) {
      setErr(btn, error);
    }
  }

  async approvePR(btn, pr) {
    setLoading(btn);
    try {
      await this.api(
        "POST",
        `/repos/${pr.owner}/${pr.repo}/pulls/${pr.number}/reviews`,
        {
          event: "APPROVE",
        },
      );
      setDone(btn, "Approved ✓");
    } catch (error) {
      setErr(btn, error);
    }
  }

  async mergePR(btn, pr, method) {
    setLoading(btn);
    try {
      await this.api(
        "PUT",
        `/repos/${pr.owner}/${pr.repo}/pulls/${pr.number}/merge`,
        {
          merge_method: method,
        },
      );
      setDone(btn, method === "squash" ? "Squashed ✓" : "Merged ✓");
    } catch (error) {
      setErr(btn, error);
    }
  }

  async doAll(btn, pr) {
    try {
      setLoading(btn, "Assigning…");
      await this.api(
        "POST",
        `/repos/${pr.owner}/${pr.repo}/issues/${pr.number}/assignees`,
        {
          assignees: [GITHUB_USER],
        },
      );
      btn.textContent = "Approving…";
      await this.api(
        "POST",
        `/repos/${pr.owner}/${pr.repo}/pulls/${pr.number}/reviews`,
        {
          event: "APPROVE",
        },
      );
      btn.textContent = "Merging…";
      await this.api(
        "PUT",
        `/repos/${pr.owner}/${pr.repo}/pulls/${pr.number}/merge`,
        {
          merge_method: "squash",
        },
      );
      setDone(btn, "Done ✓");
    } catch (error) {
      setErr(btn, error);
    }
  }

  buildTokenForm(doc, panel, pr) {
    const msg = doc.createElement("div");
    msg.textContent = "PAT with repo scope:";
    Object.assign(msg.style, {
      color: "#8b949e",
      fontSize: "11px",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    });

    const input = doc.createElement("input");
    input.type = "password";
    input.placeholder = "ghp_…";
    Object.assign(input.style, {
      background: "#0d1117",
      color: "#e6edf3",
      border: "1px solid #30363d",
      borderRadius: "6px",
      padding: "5px 8px",
      fontSize: "12px",
      width: "100%",
      boxSizing: "border-box",
      fontFamily: "monospace",
    });

    const saveBtn = mkBtn(doc, "Save token", "#1f6feb", async () => {
      const token = input.value.trim();
      if (!token) {
        return;
      }
      await this.sendQuery("token:set", { token });
      panel.replaceChildren();
      this.buildActionButtons(doc, panel, pr);
    });

    panel.append(msg, input, saveBtn);
    setTimeout(() => input.focus(), 50);
  }

  buildActionButtons(doc, panel, pr) {
    const heading = doc.createElement("div");
    heading.textContent = "Quick Actions";
    Object.assign(heading.style, {
      color: "#8b949e",
      fontSize: "11px",
      fontWeight: "600",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: "2px",
    });

    const divider = doc.createElement("hr");
    Object.assign(divider.style, {
      border: "none",
      borderTop: "1px solid #30363d",
      margin: "2px 0",
    });

    const btnDoAll = mkBtn(
      doc,
      "⚡ Assign + Approve + Squash merge",
      "#6e40c9",
      () => this.doAll(btnDoAll, pr),
    );
    const btnAssign = mkBtn(doc, "Assign me", "#1f6feb", () =>
      this.assignSelf(btnAssign, pr),
    );
    const btnApprove = mkBtn(doc, "Approve", "#388bfd", () =>
      this.approvePR(btnApprove, pr),
    );
    const btnMerge = mkBtn(doc, "Merge", "#2ea043", () =>
      this.mergePR(btnMerge, pr, "merge"),
    );
    const btnSquash = mkBtn(doc, "Squash & merge", "#2ea043", () =>
      this.mergePR(btnSquash, pr, "squash"),
    );

    const resetLink = doc.createElement("a");
    resetLink.textContent = "Reset token";
    Object.assign(resetLink.style, {
      color: "#8b949e",
      fontSize: "10px",
      textAlign: "center",
      cursor: "pointer",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      marginTop: "4px",
    });
    resetLink.addEventListener("click", async (event) => {
      if (!event.isTrusted) {
        return;
      }
      await this.sendQuery("token:clear");
      panel.replaceChildren();
      this.buildTokenForm(doc, panel, pr);
    });

    panel.append(
      heading,
      btnDoAll,
      divider,
      btnAssign,
      btnApprove,
      btnMerge,
      btnSquash,
      resetLink,
    );
  }

  async inject() {
    const doc = this.actor.document;
    if (!doc?.body || doc.getElementById("gh-quick-actions")) {
      return;
    }

    const pr = parsePRUrl(doc.location?.href);
    if (!pr) {
      return;
    }

    const panel = doc.createElement("div");
    panel.id = "gh-quick-actions";
    Object.assign(panel.style, {
      position: "fixed",
      bottom: "24px",
      right: "24px",
      zIndex: "9999",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      padding: "12px",
      background: "#161b22",
      border: "1px solid #30363d",
      borderRadius: "10px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    });

    const token = await this.sendQuery("token:get");
    if (token) {
      this.buildActionButtons(doc, panel, pr);
    } else {
      this.buildTokenForm(doc, panel, pr);
    }

    doc.body.appendChild(panel);
  }

  reinject() {
    this.actor.document.getElementById("gh-quick-actions")?.remove();
    this.inject().catch((error) =>
      console.error("[github-pr-actions] inject failed", error),
    );
  }
}
