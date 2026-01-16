"use client";

import { useEffect, useState } from "react";
import { CallbackPage, type ImmutableAuthConfig } from "@imtbl/auth-next-client";
import { getAuthConfig } from "@/lib/immutable-auth";
import { EnvironmentNames } from "@/types";
import { Container, Spinner } from "react-bootstrap";

/**
 * OAuth callback page - reads environment from localStorage to use correct config
 */
export default function Callback() {
  const [config, setConfig] = useState<ImmutableAuthConfig | null>(null);

  useEffect(() => {
    // Read environment from localStorage (same key as ImmutableProvider uses)
    // Default to DEV to match ImmutableProvider's default context environment
    const storedEnv = localStorage.getItem("IMX_PASSPORT_SAMPLE_ENVIRONMENT");
    let environment = EnvironmentNames.DEV;
    
    if (storedEnv) {
      try {
        environment = JSON.parse(storedEnv) as EnvironmentNames;
      } catch {
        // If localStorage value is corrupted, fall back to DEV
      }
    }
    
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
