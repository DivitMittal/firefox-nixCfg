const lazy = {};
ChromeUtils.defineESModuleGetters(lazy, {
  Services: "resource://gre/modules/Services.sys.mjs",
});

const ALLOWED_HOSTS = ["musescore.com", "ultimate-guitar.com", "wasabisys.com"];

function assertAllowedUrl(url) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") {
    throw new Error("Only HTTPS URLs are allowed");
  }
  if (
    !ALLOWED_HOSTS.some(
      (host) =>
        parsed.hostname === host || parsed.hostname.endsWith(`.${host}`),
    )
  ) {
    throw new Error("URL host is not allowed");
  }
}

async function readResponse(response, responseType) {
  if (responseType === "arraybuffer" || responseType === "blob") {
    return {
      response: await response.arrayBuffer(),
      responseText: "",
    };
  }
  if (responseType === "json") {
    return {
      response: await response.json(),
      responseText: "",
    };
  }
  const text = await response.text();
  return {
    response: text,
    responseText: text,
  };
}

async function request({
  method = "GET",
  url,
  headers,
  data,
  responseType = "text",
}) {
  assertAllowedUrl(url);

  const response = await fetch(url, {
    method,
    headers,
    body: data || undefined,
  });
  const body = await readResponse(response, responseType);
  return {
    readyState: 4,
    status: response.status,
    statusText: response.statusText,
    finalUrl: response.url,
    responseHeaders: [...response.headers.entries()]
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n"),
    ...body,
  };
}

function openInTab(url) {
  assertAllowedUrl(url);

  lazy.Services.wm
    .getMostRecentWindow("navigator:browser")
    ?.openTrustedLinkIn(url, "tab");
}

export class DlLibrescoreShimParent extends JSWindowActorParent {
  async receiveMessage(message) {
    switch (message.name) {
      case "gm:xmlHttpRequest":
        return request(message.data);
      case "gm:openInTab":
        openInTab(message.data.url);
        return true;
      default:
        throw new Error(`Unknown message type: '${message.name}'`);
    }
  }
}
