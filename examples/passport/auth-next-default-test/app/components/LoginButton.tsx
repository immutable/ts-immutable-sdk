"use client";

import { useLogin, useImmutableSession } from "@imtbl/auth-next-client";

export function LoginButton() {
  const { isAuthenticated, session } = useImmutableSession();
  const { loginWithPopup, isLoggingIn, error } = useLogin();

  if (isAuthenticated && session) {
    return (
      <div className="success">
        <h3>✅ Logged In</h3>
        <p>Email: <span className="code">{session.user?.email || 'N/A'}</span></p>
        <p>User ID: <span className="code">{session.user?.sub || 'N/A'}</span></p>
      </div>
    );
  }

  return (
    <div>
      <h3>Test Login (Zero Config)</h3>
      <button 
        onClick={() => loginWithPopup()} 
        disabled={isLoggingIn}
      >
        {isLoggingIn ? "Signing in..." : "🔐 Sign In with Popup"}
      </button>
      {error && <p className="error">Error: {error}</p>}
      <p className="info">
        This uses <span className="code">loginWithPopup()</span> with no config!<br/>
        ClientId and redirectUri are auto-detected.
      </p>
    </div>
  );
}
