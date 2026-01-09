import type { DefaultSession, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

/**
 * Configuration for ImmutableAuthProvider and createImmutableAuth
 */
export interface ImmutableAuthConfig {
  /**
   * Immutable OAuth client ID
   */
  clientId: string;

  /**
   * OAuth callback redirect URI (used for redirect flow)
   */
  redirectUri: string;

  /**
   * OAuth callback redirect URI for popup flow
   * If not provided, falls back to redirectUri
   */
  popupRedirectUri?: string;

  /**
   * Where to redirect after logout
   */
  logoutRedirectUri?: string;

  /**
   * OAuth audience (default: "platform_api")
   */
  audience?: string;

  /**
   * OAuth scopes (default: "openid profile email offline_access transact")
   */
  scope?: string;

  /**
   * Authentication domain (default: "https://auth.immutable.com")
   */
  authenticationDomain?: string;

  /**
   * Passport domain for transaction confirmation popups.
   * Must be set correctly for the target environment:
   * - Production: "https://passport.immutable.com"
   * - Sandbox: "https://passport.sandbox.immutable.com"
   *
   * If not provided, defaults to production ("https://passport.immutable.com").
   * This is important for transaction signing flows to work correctly.
   */
  passportDomain?: string;
}

/**
 * zkEVM wallet information
 */
export interface ZkEvmInfo {
  ethAddress: string;
  userAdminAddress: string;
}

/**
 * User profile from Immutable
 */
export interface ImmutableUser {
  sub: string;
  email?: string;
  nickname?: string;
}

/**
 * Auth.js v5 module augmentation to add Immutable-specific fields
 */
declare module 'next-auth' {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  interface Session extends DefaultSession {
    user: ImmutableUser & DefaultSession['user'];
    accessToken: string;
    refreshToken?: string;
    idToken?: string;
    accessTokenExpires: number;
    zkEvm?: ZkEvmInfo;
    error?: string;
  }

  interface User {
    id: string;
    sub: string;
    email?: string | null;
    nickname?: string;
    accessToken: string;
    refreshToken?: string;
    idToken?: string;
    accessTokenExpires: number;
    zkEvm?: ZkEvmInfo;
  }
}

declare module 'next-auth/jwt' {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  interface JWT {
    sub?: string;
    email?: string | null;
    nickname?: string;
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    accessTokenExpires?: number;
    zkEvm?: ZkEvmInfo;
    error?: string;
  }
}

/**
 * Token data passed from client to Auth.js credentials provider
 */
export interface ImmutableTokenData {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpires: number;
  profile: {
    sub: string;
    email?: string;
    nickname?: string;
  };
  zkEvm?: ZkEvmInfo;
}

/**
 * Response from the userinfo endpoint
 * Used for server-side token validation
 */
export interface UserInfoResponse {
  /** Subject - unique user identifier */
  sub: string;
  /** User's email address */
  email?: string;
  /** User's nickname/username */
  nickname?: string;
  /** User's full name */
  name?: string;
  /** User's profile picture URL */
  picture?: string;
  /** When the user profile was last updated */
  updated_at?: string;
  /** Whether the email has been verified */
  email_verified?: boolean;
}

/**
 * Props for ImmutableAuthProvider
 */
export interface ImmutableAuthProviderProps {
  children: React.ReactNode;
  /**
   * Immutable auth configuration
   */
  config: ImmutableAuthConfig;
  /**
   * Initial session from server (for SSR hydration)
   * Can be Session from auth() or any compatible session object
   */
  session?: Session | DefaultSession | null;
  /**
   * Custom base path for Auth.js API routes
   * Use this when you have multiple auth endpoints (e.g., per environment)
   * @default "/api/auth"
   */
  basePath?: string;
}

/**
 * Return type of useImmutableAuth hook
 */
export interface UseImmutableAuthReturn {
  /**
   * Current user profile (null if not authenticated)
   */
  user: ImmutableUser | null;
  /**
   * Full Auth.js session with tokens
   */
  session: Session | null;
  /**
   * Whether authentication state is loading
   */
  isLoading: boolean;
  /**
   * Whether user is authenticated
   */
  isAuthenticated: boolean;
  /**
   * Sign in with Immutable (opens popup)
   * @param options - Optional login options (cached session, silent login, redirect flow, direct login)
   */
  signIn: (options?: import('@imtbl/auth').LoginOptions) => Promise<void>;
  /**
   * Sign out from both Auth.js and Immutable
   */
  signOut: () => Promise<void>;
  /**
   * Get a valid access token (refreshes if needed)
   */
  getAccessToken: () => Promise<string>;
  /**
   * The underlying Auth instance (for advanced use)
   */
  auth: import('@imtbl/auth').Auth | null;
}

// Re-export JWT type for use in refresh.ts
export type { JWT };
