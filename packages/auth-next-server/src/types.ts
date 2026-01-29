/**
 * Server-side types for @imtbl/auth-next-server
 */

import type { DefaultSession } from 'next-auth';

/**
 * zkEVM wallet information for module augmentation
 */
interface ZkEvmInfo {
  ethAddress: `0x${string}`;
  userAdminAddress: `0x${string}`;
}

/**
 * Auth.js v5 module augmentation to add Immutable-specific fields
 * This extends the Session type to include our custom fields
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
 * Configuration options for Immutable authentication
 */
export interface ImmutableAuthConfig {
  /**
   * Your Immutable application client ID
   */
  clientId: string;

  /**
   * The OAuth redirect URI configured in your Immutable Hub project
   */
  redirectUri: string;

  /**
   * OAuth audience (default: "platform_api")
   */
  audience?: string;

  /**
   * OAuth scopes (default: "openid profile email offline_access transact")
   */
  scope?: string;

  /**
   * The Immutable authentication domain (default: "https://auth.immutable.com")
   */
  authenticationDomain?: string;
}

/**
 * Token data passed from client to server during authentication
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
  zkEvm?: {
    ethAddress: string;
    userAdminAddress: string;
  };
}

/**
 * Response from the userinfo endpoint
 */
export interface UserInfoResponse {
  sub: string;
  email?: string;
  email_verified?: boolean;
  nickname?: string;
  [key: string]: unknown;
}

/**
 * zkEVM user data stored in session
 */
export interface ZkEvmUser {
  ethAddress: string;
  userAdminAddress: string;
}

/**
 * Immutable user data structure
 */
export interface ImmutableUser {
  sub: string;
  email?: string;
  nickname?: string;
  zkEvm?: ZkEvmUser;
}
