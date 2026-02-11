"use client";

import { CallbackPage } from "@imtbl/auth-next-client";
import {
  DEFAULT_PRODUCTION_CLIENT_ID,
  DEFAULT_SANDBOX_CLIENT_ID,
} from "@imtbl/auth-next-client";

export default function Callback() {
  // Auto-detect environment and derive config
  const isSandbox = typeof window !== 'undefined' && 
    (window.location.hostname.includes('sandbox') || window.location.hostname.includes('localhost'));
  
  const config = {
    clientId: isSandbox ? DEFAULT_SANDBOX_CLIENT_ID : DEFAULT_PRODUCTION_CLIENT_ID,
    redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/callback` : '/callback',
  };

  return (
    <div>
      <h1>Processing authentication...</h1>
      <CallbackPage config={config} redirectTo="/" />
    </div>
  );
}

