import type { DefaultSession, Session } from 'next-auth';

// Re-export types from auth-next-server for convenience
export type {
  ImmutableAuthConfig,
  ImmutableTokenData,
  ZkEvmUser,
  ImmutableUser,
} from '@imtbl/auth-next-server';

/**
 * zkEVM wallet information
 */
export interface ZkEvmInfo {
  ethAddress: string;
  userAdminAddress: string;
}

/**
 * Auth.js v5 module augmentation to add Immutable-specific fields
 */
declare module 'next-auth' {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  interface Session extends DefaultSession {
    user: {
      sub: string;
      email?: string;
      nickname?: string;
    } & DefaultSession['user'];
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

/**
 * Props for ImmutableAuthProvider
 */
export interface ImmutableAuthProviderProps {
  children: React.ReactNode;
  /**
   * Immutable auth configuration
   */
  config: {
    clientId: string;
    redirectUri: string;
    popupRedirectUri?: string;
    logoutRedirectUri?: string;
    audience?: string;
    scope?: string;
    authenticationDomain?: string;
    passportDomain?: string;
  };
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
 * User profile from Immutable (local definition for client)
 */
export interface ImmutableUserClient {
  sub: string;
  email?: string;
  nickname?: string;
}

/**
 * Token data passed from client to Auth.js credentials provider
 */
export interface ImmutableTokenDataClient {
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
 * Return type of useImmutableAuth hook
 */
export interface UseImmutableAuthReturn {
  /**
   * Current user profile (null if not authenticated)
   */
  user: ImmutableUserClient | null;
  /**
   * Full Auth.js session with tokens
   */
  session: Session | null;
  /**
   * Whether authentication state is loading (initial session fetch)
   */
  isLoading: boolean;
  /**
   * Whether a login flow is in progress (popup open, waiting for OAuth callback)
   */
  isLoggingIn: boolean;
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
