"use client";

import {
  CallbackPage,
  DEFAULT_REDIRECT_URI_PATH,
  DEFAULT_SANDBOX_CLIENT_ID,
} from "@imtbl/auth-next-client";

export default function AuthCallback() {
  // Build redirectUri only when window exists to avoid prerender error
  const config =
    typeof window !== "undefined"
      ? {
          clientId: DEFAULT_SANDBOX_CLIENT_ID,
          redirectUri: `${window.location.origin}${DEFAULT_REDIRECT_URI_PATH}`,
        }
      : null;

  if (!config) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Processing authentication...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Processing authentication...</h1>
      <CallbackPage config={config} redirectTo="/connect-with-auth-next" />
    </div>
  );
}
