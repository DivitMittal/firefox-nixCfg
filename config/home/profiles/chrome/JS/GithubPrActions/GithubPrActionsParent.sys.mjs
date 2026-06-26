const PREF_TOKEN = "extensions.github-pr-actions.token";

const lazy = {};
ChromeUtils.defineESModuleGetters(lazy, {
  Services: "resource://gre/modules/Services.sys.mjs",
});

const API_PATTERNS = [
  { method: "POST", path: /^\/repos\/[^/]+\/[^/]+\/issues\/\d+\/assignees$/ },
  { method: "POST", path: /^\/repos\/[^/]+\/[^/]+\/pulls\/\d+\/reviews$/ },
  { method: "PUT", path: /^\/repos\/[^/]+\/[^/]+\/pulls\/\d+\/merge$/ },
];

function getToken() {
  try {
    return lazy.Services.prefs.getStringPref(PREF_TOKEN, "");
  } catch (_error) {
    return "";
  }
}

async function api({ method, path, body }) {
  if (
    !API_PATTERNS.some(
      (pattern) => pattern.method === method && pattern.path.test(path),
    )
  ) {
    throw new Error("Unsupported GitHub API request");
  }

  const token = getToken();
  if (!token) {
    throw new Error("No token stored");
  }

  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }
  return data;
}

export class GithubPrActionsParent extends JSWindowActorParent {
  async receiveMessage(message) {
    switch (message.name) {
      case "token:get":
        return getToken();
      case "token:set":
        lazy.Services.prefs.setStringPref(PREF_TOKEN, message.data.token);
        return true;
      case "token:clear":
        try {
          lazy.Services.prefs.clearUserPref(PREF_TOKEN);
        } catch (_error) {
          // Missing pref is already the desired state.
        }
        return true;
      case "github:api":
        return api(message.data);
      default:
        throw new Error(`Unknown message type: '${message.name}'`);
    }
  }
}
