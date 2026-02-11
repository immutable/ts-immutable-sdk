"use client";

import { useLogout, useImmutableSession } from "@imtbl/auth-next-client";

export function LogoutButton() {
  const { isAuthenticated } = useImmutableSession();
  const { logout, isLoggingOut, error } = useLogout();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <h3>Test Logout (Zero Config)</h3>
      <button 
        onClick={() => logout()} 
        disabled={isLoggingOut}
      >
        {isLoggingOut ? "Signing out..." : "🚪 Sign Out"}
      </button>
      {error && <p className="error">Error: {error}</p>}
      <p className="info">
        This uses <span className="code">logout()</span> with no config!<br/>
        Performs federated logout to clear both local and upstream sessions.
      </p>
    </div>
  );
}
