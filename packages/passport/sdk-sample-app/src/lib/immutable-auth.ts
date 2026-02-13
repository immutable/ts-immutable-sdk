/**
 * Client-safe auth configuration utilities.
 * This file can be imported by both client and server code.
 * 
 * For NextAuth instances (server-only), see ./immutable-auth.server.ts
 */
import type { ImmutableAuthConfig } from "@imtbl/auth-next-server";
import { deriveDefaultClientId } from "@imtbl/auth-next-server";
import { EnvironmentNames } from "@/types";
import { BASE_PATH } from "@/config";

// Client IDs for each environment (same as ImmutableProvider)
const CLIENT_IDS: Partial<Record<EnvironmentNames, string>> = {
  [EnvironmentNames.PRODUCTION]: "PtQRK4iRJ8GkXjiz6xfImMAYhPhW0cYk",
  [EnvironmentNames.SANDBOX]: "mjtCL8mt06BtbxSkp2vbrYStKWnXVZfo",
  [EnvironmentNames.DEV]: "pCtSnHovRnPiQuBcFkXAnbCNqNVcDM3m",
  // DEFAULT uses deriveDefaultClientId() - not in this map
};

// Auth domains for each environment
const AUTH_DOMAINS: Record<EnvironmentNames, string> = {
  [EnvironmentNames.PRODUCTION]: "https://auth.immutable.com",
  [EnvironmentNames.SANDBOX]: "https://auth.immutable.com",
  [EnvironmentNames.DEV]: "https://auth.dev.immutable.com",
  [EnvironmentNames.DEFAULT]: "https://auth.immutable.com",
};

// Get auth config for a specific environment
export function getAuthConfig(environment: EnvironmentNames): ImmutableAuthConfig {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  return {
    clientId: environment === EnvironmentNames.DEFAULT ? deriveDefaultClientId() : CLIENT_IDS[environment]!,
    redirectUri: `${baseUrl}${BASE_PATH}/callback`,
    audience: "platform_api",
    scope: "openid profile email offline_access transact",
    authenticationDomain: AUTH_DOMAINS[environment],
  };
}

// Export types for convenience
export type { ImmutableAuthConfig };
