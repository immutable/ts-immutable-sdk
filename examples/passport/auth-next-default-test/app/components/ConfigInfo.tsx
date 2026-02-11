"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_PRODUCTION_CLIENT_ID,
  DEFAULT_SANDBOX_CLIENT_ID,
} from "@imtbl/auth-next-client";

export function ConfigInfo() {
  const [info, setInfo] = useState<{
    hostname: string;
    isSandbox: boolean;
    expectedClientId: string;
    redirectUri: string;
  } | null>(null);

  useEffect(() => {
    const hostname = window.location.hostname;
    const isSandbox = hostname.includes('sandbox') || hostname.includes('localhost');
    const expectedClientId = isSandbox ? DEFAULT_SANDBOX_CLIENT_ID : DEFAULT_PRODUCTION_CLIENT_ID;
    const redirectUri = `${window.location.origin}/callback`;

    setInfo({
      hostname,
      isSandbox,
      expectedClientId,
      redirectUri,
    });
  }, []);

  if (!info) {
    return <div>Loading config info...</div>;
  }

  return (
    <div className="info">
      <h3>📋 Auto-Detected Configuration</h3>
      <ul>
        <li><strong>Hostname:</strong> <span className="code">{info.hostname}</span></li>
        <li><strong>Environment:</strong> <span className="code">{info.isSandbox ? 'Sandbox' : 'Production'}</span></li>
        <li><strong>ClientId:</strong> <span className="code">{info.expectedClientId}</span></li>
        <li><strong>RedirectUri:</strong> <span className="code">{info.redirectUri}</span></li>
      </ul>
      <p><small>These values are automatically detected and don't need to be configured!</small></p>
    </div>
  );
}
