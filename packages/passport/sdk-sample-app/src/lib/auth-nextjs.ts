import type { ImmutableAuthConfig } from "@imtbl/auth-nextjs";
import { EnvironmentNames } from "@/types";

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
    redirectUri: `${baseUrl}/callback`,
    audience: "platform_api",
    scope: "openid profile email offline_access transact",
    authenticationDomain: AUTH_DOMAINS[environment],
  };
}

