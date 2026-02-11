"use client";

import { useLogin, useImmutableSession } from "@imtbl/auth-next-client";
import { useState } from "react";

export function LoginWithOverride() {
  const { isAuthenticated, session } = useImmutableSession();
  const { loginWithPopup, isLoggingIn, error } = useLogin();
  const [customClientId, setCustomClientId] = useState("");

  if (isAuthenticated && session) {
    return (
      <div className="success">
        <h3>✅ Logged In with Override</h3>
        <p>Email: <span className="code">{session.user?.email || 'N/A'}</span></p>
      </div>
    );
  }

  return (
    <div>
      <h3>Test Login with Custom ClientId Override</h3>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Enter custom clientId (optional)"
          value={customClientId}
          onChange={(e) => setCustomClientId(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            fontSize: '0.9rem',
            borderRadius: '0.25rem',
            border: '1px solid #ccc',
          }}
        />
        <small style={{ display: 'block', marginTop: '0.5rem', color: '#666' }}>
          Leave empty to use default sandbox clientId
        </small>
      </div>
      <button 
        onClick={() => loginWithPopup(customClientId ? {
          clientId: customClientId,
          // Other fields will use defaults
        } : undefined)} 
        disabled={isLoggingIn}
      >
        {isLoggingIn ? "Signing in..." : "🔐 Sign In with Override"}
      </button>
      {error && <p className="error">Error: {error}</p>}
      <p className="info">
        This tests <span className="code">loginWithPopup(&#123; clientId: &apos;...&apos; &#125;)</span><br/>
        Custom clientId overrides the default, but redirectUri is still auto-detected.
      </p>
    </div>
  );
}
