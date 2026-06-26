export function setLoading(btn, text = "…") {
  btn.disabled = true;
  btn.dataset.orig = btn.textContent;
  btn.textContent = text;
  btn.style.opacity = "0.6";
}

export function setDone(btn, text) {
  btn.textContent = text;
  btn.style.background = "#2ea043";
  btn.style.opacity = "1";
}

export function setErr(btn, error) {
  btn.disabled = false;
  btn.textContent = btn.dataset.orig;
  btn.style.opacity = "1";
  btn.title = error?.message ?? String(error);
  btn.style.background = "#da3633";
  setTimeout(() => {
    btn.style.background = "";
    btn.title = "";
  }, 3000);
}

export function mkBtn(doc, label, color, onClick) {
  const btn = doc.createElement("button");
  btn.textContent = label;
  Object.assign(btn.style, {
    background: color,
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    transition: "opacity 0.15s, background 0.15s",
    whiteSpace: "nowrap",
  });
  btn.addEventListener("mouseenter", () => {
    if (!btn.disabled) {
      btn.style.opacity = "0.85";
    }
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.opacity = "1";
  });
  btn.addEventListener("click", (event) => {
    if (event.isTrusted) {
      onClick();
    }
  });
  return btn;
}
