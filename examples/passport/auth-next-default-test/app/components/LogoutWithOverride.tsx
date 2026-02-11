"use client";

import { useLogout, useImmutableSession } from "@imtbl/auth-next-client";
import { useState } from "react";

export function LogoutWithOverride() {
  const { isAuthenticated } = useImmutableSession();
  const { logout, isLoggingOut, error } = useLogout();
  const [customRedirectUri, setCustomRedirectUri] = useState("");

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <h3>Test Logout with Custom Redirect Override</h3>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Enter custom logoutRedirectUri (optional)"
          value={customRedirectUri}
          onChange={(e) => setCustomRedirectUri(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem',
            fontSize: '0.9rem',
            borderRadius: '0.25rem',
            border: '1px solid #ccc',
          }}
        />
        <small style={{ display: 'block', marginTop: '0.5rem', color: '#666' }}>
          Leave empty to use default (http://localhost:3000)
        </small>
      </div>
      <button 
        onClick={() => logout(customRedirectUri ? {
          logoutRedirectUri: customRedirectUri,
          // ClientId will use default
        } : undefined)} 
        disabled={isLoggingOut}
      >
        {isLoggingOut ? "Signing out..." : "🚪 Sign Out with Override"}
      </button>
      {error && <p className="error">Error: {error}</p>}
      <p className="info">
        This tests <span className="code">logout(&#123; logoutRedirectUri: '...' &#125;)</span><br/>
        Custom redirect after logout, but clientId is still auto-detected.
      </p>
    </div>
  );
}
