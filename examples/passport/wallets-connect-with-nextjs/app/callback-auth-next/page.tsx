"use client";

import { CallbackPage } from "@imtbl/auth-next-client";

export default function AuthNextCallback() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Processing authentication...</h1>
      <CallbackPage redirectTo="/connect-with-auth-next" />
    </div>
  );
}
