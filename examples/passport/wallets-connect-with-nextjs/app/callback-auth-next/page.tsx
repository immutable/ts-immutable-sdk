"use client";

import { CallbackPage, DEFAULT_SANDBOX_CLIENT_ID } from "@imtbl/auth-next-client";

export default function AuthNextCallback() {
  // Use DEFAULT_SANDBOX_CLIENT_ID to match login flow (zero config = sandbox)
  const config = {
    clientId: DEFAULT_SANDBOX_CLIENT_ID,
    redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/callback-auth-next` : '/callback-auth-next',
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Processing authentication...</h1>
      <CallbackPage config={config} redirectTo="/connect-with-auth-next" />
    </div>
  );
}

