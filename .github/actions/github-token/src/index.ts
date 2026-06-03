import * as core from "@actions/core";

const TOKEN_SERVICE_URL = "https://immutabot.security.immutable.com";
const TOKEN_SERVICE_AUDIENCE = "immutabot";
const REQUEST_TIMEOUT_MS = 30_000;

const REPO_PATTERN = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;

function parseRepositories(input: string): string[] {
  const repos = input
    .split("\n")
    .map((r) => r.trim())
    .filter((r) => r.length > 0);

  if (repos.length === 0) {
    throw new Error("At least one repository must be specified");
  }

  if (repos.length > 5) {
    throw new Error("A maximum of 5 repositories may be requested per token");
  }

  for (const repo of repos) {
    if (!REPO_PATTERN.test(repo)) {
      throw new Error(`Invalid repository format: "${repo}" — expected "owner/repo"`);
    }
  }

  return repos;
}

function parsePermissions(input: string): Record<string, string> {
  if (!input.trim()) {
    return { contents: "read" };
  }

  const permissions: Record<string, string> = {};

  for (const line of input.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) {
      throw new Error(`Invalid permissions format: "${trimmed}" — expected "key: value"`);
    }

    const key = trimmed.slice(0, colonIndex).trim();
    const value = trimmed.slice(colonIndex + 1).trim();

    if (!key || !value) {
      throw new Error(`Invalid permissions entry: "${trimmed}" — key and value must not be empty`);
    }

    permissions[key] = value;
  }

  if (Object.keys(permissions).length === 0) {
    throw new Error("Permissions input was provided but contained no valid entries");
  }

  return permissions;
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function run(): Promise<void> {
  // Validate inputs before any network calls
  const repositories = parseRepositories(core.getInput("repositories", { required: true }));
  const permissions = parsePermissions(core.getInput("permissions"));

  // Fetch OIDC token — mask immediately before any logging path
  const oidcToken = await core.getIDToken(TOKEN_SERVICE_AUDIENCE);
  core.setSecret(oidcToken);

  // Exchange OIDC token for scoped installation token
  let response: Response;
  try {
    response = await fetchWithTimeout(`${TOKEN_SERVICE_URL}/v1/github/token/actions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${oidcToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ repositories, permissions }),
    });
  } catch (err) {
    const message =
      err instanceof Error && err.name === "AbortError"
        ? `Token Service request timed out after ${REQUEST_TIMEOUT_MS / 1000}s`
        : "Token Service request failed — check your network or Token Service availability";
    throw new Error(message, { cause: err });
  }

  if (!response.ok) {
    // Response body deliberately excluded — it may contain internal detail
    throw new Error(`Token Service returned HTTP ${response.status}`);
  }

  const body: unknown = await response.json();

  if (
    typeof body !== "object" ||
    body === null ||
    !("token" in body) ||
    typeof (body as Record<string, unknown>).token !== "string" ||
    !(body as { token: string }).token
  ) {
    throw new Error("Token Service returned an unexpected response shape");
  }

  const token = (body as { token: string }).token;
  core.setSecret(token);
  core.setOutput("token", token);
  core.info("Successfully obtained installation token");
}

run().catch((err: unknown) => {
  core.setFailed(err instanceof Error ? err.message : String(err));
});
