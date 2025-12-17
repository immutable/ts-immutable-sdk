import { useEffect, useState } from "react";
import { CallbackPage } from "@imtbl/auth-nextjs/client";
import { getAuthConfig } from "@/lib/auth-nextjs";
import { EnvironmentNames } from "@/types";
import type { ImmutableAuthConfig } from "@imtbl/auth-nextjs";
import { Container, Spinner } from "react-bootstrap";

/**
 * OAuth callback page - reads environment from localStorage to use correct config
 */
export default function Callback() {
  const [config, setConfig] = useState<ImmutableAuthConfig | null>(null);

  useEffect(() => {
    // Read environment from localStorage (same key as ImmutableProvider uses)
    const storedEnv = localStorage.getItem("IMX_PASSPORT_SAMPLE_ENVIRONMENT");
    const environment = storedEnv 
      ? (JSON.parse(storedEnv) as EnvironmentNames)
      : EnvironmentNames.SANDBOX;
    
    setConfig(getAuthConfig(environment));
  }, []);

  if (!config) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status" />
        <p className="mt-3">Loading...</p>
      </Container>
    );
  }

  return (
    <CallbackPage
      config={config}
      loadingComponent={
        <Container className="mt-5 text-center">
          <Spinner animation="border" role="status" />
          <p className="mt-3">Completing authentication...</p>
        </Container>
      }
    />
  );
}

