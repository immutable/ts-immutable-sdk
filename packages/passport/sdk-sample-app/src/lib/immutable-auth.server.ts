/**
 * Server-only NextAuth instances.
 * This file should ONLY be imported by server code (API routes, server components).
 * 
 * For client-safe utilities, see ./immutable-auth.ts
 */
import { NextAuth, createAuthConfig } from "@imtbl/auth-next-server";
import { EnvironmentNames } from "@/types";
import { getAuthConfig } from "./immutable-auth";

// Shared auth options with development secret
// In production, use AUTH_SECRET environment variable instead
const sharedAuthOptions = {
  secret: process.env.AUTH_SECRET || "dev-secret-do-not-use-in-production-32ch",
  trustHost: true,
};

// Each environment needs its own basePath to match the route structure
// Note: In a real app, you'd typically have one environment
// This sample app supports multiple environments for testing
export const devAuth = NextAuth({
  ...createAuthConfig(getAuthConfig(EnvironmentNames.DEV)),
  ...sharedAuthOptions,
  basePath: "/api/auth/dev",
});

export const sandboxAuth = NextAuth({
  ...createAuthConfig(getAuthConfig(EnvironmentNames.SANDBOX)),
  ...sharedAuthOptions,
  basePath: "/api/auth/sandbox",
});

export const prodAuth = NextAuth({
  ...createAuthConfig(getAuthConfig(EnvironmentNames.PRODUCTION)),
  ...sharedAuthOptions,
  basePath: "/api/auth/prod",
});

// Default auth (zero config): uses createAuthConfig() with no args.
// Always uses sandbox. Enables testing default auth with wallet and transactions.
export const defaultAuth = NextAuth({
  ...createAuthConfig(),
  ...sharedAuthOptions,
  basePath: "/api/auth/default",
});
