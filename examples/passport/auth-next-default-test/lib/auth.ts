import NextAuth from "next-auth";
import { createDefaultAuthConfig } from "@imtbl/auth-next-server";

/**
 * Zero-config setup!
 * Everything is auto-detected:
 * - clientId: auto-detected based on environment (sandbox vs production)
 * - redirectUri: auto-derived from window.location.origin + '/callback'
 * - audience, scope, authenticationDomain: use sensible defaults
 */
export const { handlers, auth, signIn, signOut } = NextAuth(createDefaultAuthConfig() as any);
