"use client";

import { CallbackPage, deriveDefaultClientId } from "@imtbl/auth-next-client";

export default function AuthNextCallback() {
  // Use deriveDefaultClientId() to match login flow (zero config = sandbox)
  const config = {
    clientId: deriveDefaultClientId(),
    redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/callback-auth-next` : '/callback-auth-next',
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Processing authentication...</h1>
      <CallbackPage config={config} redirectTo="/connect-with-auth-next" />
    </div>
  );
}

