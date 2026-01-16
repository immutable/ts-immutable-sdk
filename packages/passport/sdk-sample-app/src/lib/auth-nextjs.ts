import { createImmutableAuth, type ImmutableAuthConfig } from "@imtbl/auth-next-server";
import { EnvironmentNames } from "@/types";
import { BASE_PATH } from "@/config";

// Client IDs for each environment (same as ImmutableProvider)
const CLIENT_IDS: Record<EnvironmentNames, string> = {
  [EnvironmentNames.PRODUCTION]: "PtQRK4iRJ8GkXjiz6xfImMAYhPhW0cYk",
  [EnvironmentNames.SANDBOX]: "mjtCL8mt06BtbxSkp2vbrYStKWnXVZfo",
  [EnvironmentNames.DEV]: "pCtSnHovRnPiQuBcFkXAnbCNqNVcDM3m",
};

// Auth domains for each environment
const AUTH_DOMAINS: Record<EnvironmentNames, string> = {
  [EnvironmentNames.PRODUCTION]: "https://auth.immutable.com",
  [EnvironmentNames.SANDBOX]: "https://auth.immutable.com",
  [EnvironmentNames.DEV]: "https://auth.dev.immutable.com",
};

// Get auth-nextjs config for a specific environment
export function getAuthConfig(environment: EnvironmentNames): ImmutableAuthConfig {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

  return {
    clientId: CLIENT_IDS[environment],
    redirectUri: `${baseUrl}${BASE_PATH}/callback`,
    audience: "platform_api",
    scope: "openid profile email offline_access transact",
    authenticationDomain: AUTH_DOMAINS[environment],
  };
}

// Create auth instances for each environment
// Note: In a real app, you'd typically have one environment
// This sample app supports multiple environments for testing

// Shared auth options with development secret
// In production, use AUTH_SECRET environment variable instead
const sharedAuthOptions = {
  secret: process.env.AUTH_SECRET || "dev-secret-do-not-use-in-production-32ch",
  trustHost: true,
};

// Each environment needs its own basePath to match the route structure
export const devAuth = createImmutableAuth(getAuthConfig(EnvironmentNames.DEV), {
  ...sharedAuthOptions,
  basePath: "/api/auth/dev",
});
export const sandboxAuth = createImmutableAuth(getAuthConfig(EnvironmentNames.SANDBOX), {
  ...sharedAuthOptions,
  basePath: "/api/auth/sandbox",
});
export const prodAuth = createImmutableAuth(getAuthConfig(EnvironmentNames.PRODUCTION), {
  ...sharedAuthOptions,
  basePath: "/api/auth/prod",
});

// Export types for convenience
export type { ImmutableAuthConfig };
