import NextAuth from "next-auth";
import { createAuthConfig } from "@imtbl/auth-next-server";

/**
 * Default auth configuration for testing.
 * This uses zero-config setup to demonstrate default auth functionality.
 */
export const { handlers, auth, signIn, signOut } = NextAuth(createAuthConfig());
