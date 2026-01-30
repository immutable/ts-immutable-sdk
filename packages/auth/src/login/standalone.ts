/**
 * Standalone login functions for stateless authentication flows.
 * These functions handle OAuth login without managing session state,
 * making them ideal for use with external session managers like NextAuth.
 */

import { Detail, getDetail, track } from '@imtbl/metrics';
import { decodeJwtPayload } from '../utils/jwt';
import type {
  DirectLoginOptions, IdTokenPayload, MarketingConsentStatus, ZkEvmInfo,
} from '../types';
import { PASSPORT_OVERLAY_CONTENTS_ID } from '../overlay/constants';
import { buildLogoutUrl as internalBuildLogoutUrl } from '../logout';

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration for standalone login functions
 */
export interface LoginConfig {
  /** Your Immutable application client ID */
  clientId: string;
  /** The OAuth redirect URI for your application */
  redirectUri: string;
  /** Optional separate redirect URI for popup flows */
  popupRedirectUri?: string;
  /** OAuth audience (default: "platform_api") */
  audience?: string;
  /** OAuth scopes (default: "openid profile email offline_access transact") */
  scope?: string;
  /** Authentication domain (default: "https://auth.immutable.com") */
  authenticationDomain?: string;
}

// Embedded login prompt types
const EMBEDDED_LOGIN_PROMPT_EVENT_TYPE = 'im_passport_embedded_login_prompt';
const LOGIN_PROMPT_IFRAME_ID = 'passport-embedded-login-iframe';
const PASSPORT_OVERLAY_ID = 'passport-overlay';

enum EmbeddedLoginPromptReceiveMessage {
  LOGIN_METHOD_SELECTED = 'login_method_selected',
  LOGIN_PROMPT_ERROR = 'login_prompt_error',
  LOGIN_PROMPT_CLOSED = 'login_prompt_closed',
}

interface EmbeddedLoginPromptResult {
  marketingConsentStatus: MarketingConsentStatus;
  imPassportTraceId: string;
  directLoginMethod: string;
  email?: string;
}

/**
 * Token response from successful authentication
 */
export interface TokenResponse {
  /** OAuth access token for API calls */
  accessToken: string;
  /** OAuth refresh token for token renewal */
  refreshToken?: string;
  /** OpenID Connect ID token */
  idToken?: string;
  /** Unix timestamp (ms) when the access token expires */
  accessTokenExpires: number;
  /** User profile information */
  profile: {
    sub: string;
    email?: string;
    nickname?: string;
  };
  /** zkEVM wallet information if available */
  zkEvm?: ZkEvmInfo;
}

/**
 * Extended login options for popup/redirect flows
 */
export interface StandaloneLoginOptions {
  /** Direct login options (social provider, email, etc.) */
  directLoginOptions?: DirectLoginOptions;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_AUTH_DOMAIN = 'https://auth.immutable.com';
const DEFAULT_AUDIENCE = 'platform_api';
const DEFAULT_SCOPE = 'openid profile email offline_access transact';
const AUTHORIZE_ENDPOINT = '/authorize';
const TOKEN_ENDPOINT = '/oauth/token';

// Storage key for PKCE data
const PKCE_STORAGE_KEY = 'imtbl_pkce_data';

// ============================================================================
// Utility Functions
// ============================================================================

function base64URLEncode(buffer: ArrayBuffer | Uint8Array): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function sha256(value: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  return window.crypto.subtle.digest('SHA-256', data);
}

function generateRandomString(): string {
  return base64URLEncode(window.crypto.getRandomValues(new Uint8Array(32)));
}

function getAuthDomain(config: LoginConfig): string {
  return config.authenticationDomain || DEFAULT_AUTH_DOMAIN;
}

function getTokenExpiry(accessToken: string): number {
  try {
    const payload = decodeJwtPayload<{ exp?: number }>(accessToken);
    if (payload.exp) {
      return payload.exp * 1000; // Convert to milliseconds
    }
  } catch {
    // Fall back to 1 hour from now if we can't decode
  }
  return Date.now() + 3600 * 1000;
}

function mapTokenResponseToResult(
  tokenData: {
    access_token: string;
    refresh_token?: string;
    id_token?: string;
  },
): TokenResponse {
  const { access_token: accessToken, refresh_token: refreshToken, id_token: idToken } = tokenData;

  let profile: TokenResponse['profile'] = { sub: '' };
  let zkEvm: TokenResponse['zkEvm'] | undefined;

  if (idToken) {
    try {
      const {
        sub, email, nickname, passport,
      } = decodeJwtPayload<IdTokenPayload>(idToken);
      profile = { sub, email, nickname };

      if (passport?.zkevm_eth_address && passport?.zkevm_user_admin_address) {
        zkEvm = {
          ethAddress: passport.zkevm_eth_address as `0x${string}`,
          userAdminAddress: passport.zkevm_user_admin_address as `0x${string}`,
        };
      }
    } catch {
      // If we can't decode the ID token, we'll have minimal profile info
    }
  }

  return {
    accessToken,
    refreshToken,
    idToken,
    accessTokenExpires: getTokenExpiry(accessToken),
    profile,
    zkEvm,
  };
}

// ============================================================================
// PKCE Storage (session-only, not persisted)
// ============================================================================

interface PKCEData {
  state: string;
  verifier: string;
  redirectUri: string;
}

function savePKCEData(data: PKCEData): void {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    window.sessionStorage.setItem(PKCE_STORAGE_KEY, JSON.stringify(data));
  }
}

function getPKCEData(): PKCEData | null {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const data = window.sessionStorage.getItem(PKCE_STORAGE_KEY);
    if (data) {
      try {
        return JSON.parse(data) as PKCEData;
      } catch {
        return null;
      }
    }
  }
  return null;
}

function clearPKCEData(): void {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    window.sessionStorage.removeItem(PKCE_STORAGE_KEY);
  }
}

// ============================================================================
// Embedded Login Prompt
// ============================================================================

function appendEmbeddedLoginPromptStyles(): void {
  const styleId = 'passport-embedded-login-keyframes';
  if (document.getElementById(styleId)) {
    return;
  }

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes passportEmbeddedLoginPromptPopBounceIn {
      0% {
        opacity: 0.5;
      }
      50% {
        opacity: 1;
        transform: scale(1.05);
      }
      75% {
        transform: scale(0.98);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @media (max-height: 400px) {
      #${LOGIN_PROMPT_IFRAME_ID} {
        width: 100% !important;
        max-width: none !important;
      }
    }

    @keyframes passportEmbeddedLoginPromptOverlayFadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `;

  document.head.appendChild(style);
}

function createEmbeddedLoginIFrame(authDomain: string, clientId: string): HTMLIFrameElement {
  const runtimeId = getDetail(Detail.RUNTIME_ID);
  const iframe = document.createElement('iframe');
  iframe.id = LOGIN_PROMPT_IFRAME_ID;
  iframe.src = `${authDomain}/im-embedded-login-prompt?client_id=${clientId}&rid=${runtimeId}`;
  iframe.style.height = '100vh';
  iframe.style.width = '100vw';
  iframe.style.maxHeight = '660px';
  iframe.style.maxWidth = '440px';
  iframe.style.borderRadius = '16px';
  iframe.style.border = 'none';
  iframe.style.opacity = '0';
  iframe.style.transform = 'scale(0.6)';
  iframe.style.animation = 'passportEmbeddedLoginPromptPopBounceIn 1s ease forwards';
  appendEmbeddedLoginPromptStyles();
  return iframe;
}

function createOverlayElement(): HTMLDivElement {
  const overlay = document.createElement('div');
  overlay.id = PASSPORT_OVERLAY_ID;
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 2147483647;
    background: rgba(247, 247, 247, 0.24);
    animation-name: passportEmbeddedLoginPromptOverlayFadeIn;
    animation-duration: 0.8s;
  `;

  const contents = document.createElement('div');
  contents.id = PASSPORT_OVERLAY_CONTENTS_ID;
  contents.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  `;

  overlay.appendChild(contents);
  return overlay;
}

function removeOverlay(): void {
  const overlay = document.getElementById(PASSPORT_OVERLAY_ID);
  overlay?.remove();
}

function displayEmbeddedLoginPrompt(
  authDomain: string,
  clientId: string,
): Promise<EmbeddedLoginPromptResult> {
  return new Promise((resolve, reject) => {
    const iframe = createEmbeddedLoginIFrame(authDomain, clientId);
    const overlay = createOverlayElement();

    const messageHandler = ({ data, origin }: MessageEvent) => {
      if (
        origin !== authDomain
        || data.eventType !== EMBEDDED_LOGIN_PROMPT_EVENT_TYPE
      ) {
        return;
      }

      switch (data.messageType as EmbeddedLoginPromptReceiveMessage) {
        case EmbeddedLoginPromptReceiveMessage.LOGIN_METHOD_SELECTED: {
          const result = data.payload as EmbeddedLoginPromptResult;
          window.removeEventListener('message', messageHandler);
          removeOverlay();
          resolve(result);
          break;
        }
        case EmbeddedLoginPromptReceiveMessage.LOGIN_PROMPT_ERROR: {
          window.removeEventListener('message', messageHandler);
          removeOverlay();
          reject(new Error('Error during embedded login prompt', { cause: data.payload }));
          break;
        }
        case EmbeddedLoginPromptReceiveMessage.LOGIN_PROMPT_CLOSED: {
          window.removeEventListener('message', messageHandler);
          removeOverlay();
          reject(new Error('Login closed by user'));
          break;
        }
        default:
          window.removeEventListener('message', messageHandler);
          removeOverlay();
          reject(new Error(`Unsupported message type: ${data.messageType}`));
          break;
      }
    };

    // Close when clicking overlay background
    const overlayClickHandler = (e: MouseEvent) => {
      if (e.target === overlay) {
        window.removeEventListener('message', messageHandler);
        overlay.removeEventListener('click', overlayClickHandler);
        removeOverlay();
        reject(new Error('Login closed by user'));
      }
    };

    window.addEventListener('message', messageHandler);
    overlay.addEventListener('click', overlayClickHandler);

    const contents = overlay.querySelector(`#${PASSPORT_OVERLAY_CONTENTS_ID}`);
    if (contents) {
      contents.appendChild(iframe);
    }
    document.body.appendChild(overlay);
  });
}

// ============================================================================
// Authorization URL Builder
// ============================================================================

async function buildAuthorizationUrl(
  config: LoginConfig,
  options?: StandaloneLoginOptions,
): Promise<{ url: string; verifier: string; state: string }> {
  const authDomain = getAuthDomain(config);
  const verifier = generateRandomString();
  const challenge = base64URLEncode(await sha256(verifier));
  const state = generateRandomString();

  const url = new URL(AUTHORIZE_ENDPOINT, authDomain);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', config.redirectUri);
  url.searchParams.set('state', state);
  url.searchParams.set('scope', config.scope || DEFAULT_SCOPE);

  if (config.audience) {
    url.searchParams.set('audience', config.audience);
  } else {
    url.searchParams.set('audience', DEFAULT_AUDIENCE);
  }

  // Add direct login options if provided
  const directLoginOptions = options?.directLoginOptions;
  if (directLoginOptions) {
    if (directLoginOptions.directLoginMethod === 'email') {
      if (directLoginOptions.email) {
        url.searchParams.set('direct', 'email');
        url.searchParams.set('email', directLoginOptions.email);
      }
    } else {
      url.searchParams.set('direct', directLoginOptions.directLoginMethod);
    }
    if (directLoginOptions.marketingConsentStatus) {
      url.searchParams.set('marketingConsent', directLoginOptions.marketingConsentStatus);
    }
  }

  return { url: url.toString(), verifier, state };
}

// ============================================================================
// Token Exchange
// ============================================================================

async function exchangeCodeForTokens(
  config: LoginConfig,
  code: string,
  verifier: string,
  redirectUri: string,
): Promise<TokenResponse> {
  const authDomain = getAuthDomain(config);
  const tokenUrl = `${authDomain}${TOKEN_ENDPOINT}`;

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      code_verifier: verifier,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Token exchange failed with status ${response.status}`;
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error_description) {
        errorMessage = errorData.error_description;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      if (errorText) {
        errorMessage = errorText;
      }
    }
    throw new Error(errorMessage);
  }

  const tokenData = await response.json();
  return mapTokenResponseToResult(tokenData);
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Login with a popup window.
 * Opens a popup for OAuth authentication and returns tokens when complete.
 *
 * @param config - Login configuration
 * @param options - Optional login options (direct login, etc.)
 * @returns Promise resolving to token response
 * @throws Error if popup is blocked or login fails
 *
 * @example
 * ```typescript
 * import { loginWithPopup } from '@imtbl/auth';
 *
 * const tokens = await loginWithPopup({
 *   clientId: 'your-client-id',
 *   redirectUri: 'https://your-app.com/callback',
 * });
 * console.log(tokens.accessToken);
 * ```
 */
export async function loginWithPopup(
  config: LoginConfig,
  options?: StandaloneLoginOptions,
): Promise<TokenResponse> {
  track('passport', 'standaloneLoginWithPopup');

  const popupRedirectUri = config.popupRedirectUri || config.redirectUri;
  const popupConfig = { ...config, redirectUri: popupRedirectUri };

  const { url, verifier, state } = await buildAuthorizationUrl(popupConfig, options);

  return new Promise((resolve, reject) => {
    // Open popup
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      url,
      'immutable_login',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`,
    );

    if (!popup) {
      reject(new Error('Popup was blocked. Please allow popups for this site.'));
      return;
    }

    // Poll for popup completion
    const pollInterval = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(pollInterval);
          reject(new Error('Login popup was closed'));
          return;
        }

        // Check if we can access the popup URL (same origin after redirect)
        const popupUrl = popup.location.href;
        if (popupUrl && popupUrl.startsWith(popupRedirectUri)) {
          clearInterval(pollInterval);
          popup.close();

          const urlParams = new URL(popupUrl);
          const code = urlParams.searchParams.get('code');
          const returnedState = urlParams.searchParams.get('state');
          const error = urlParams.searchParams.get('error');
          const errorDescription = urlParams.searchParams.get('error_description');

          if (error) {
            reject(new Error(errorDescription || error));
            return;
          }

          if (!code) {
            reject(new Error('No authorization code received'));
            return;
          }

          if (returnedState !== state) {
            reject(new Error('State mismatch - possible CSRF attack'));
            return;
          }

          // Exchange code for tokens
          exchangeCodeForTokens(popupConfig, code, verifier, popupRedirectUri)
            .then(resolve)
            .catch(reject);
        }
      } catch {
        // Cross-origin access will throw - this is expected while on auth domain
      }
    }, 100);

    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (!popup.closed) {
        popup.close();
      }
      reject(new Error('Login timed out'));
    }, 5 * 60 * 1000);
  });
}

/**
 * Login with an embedded iframe modal.
 * First displays a modal for the user to select their login method (email, Google, etc.),
 * then opens a popup for OAuth authentication and returns tokens when complete.
 *
 * This provides a smoother user experience compared to loginWithPopup as the user
 * can choose their login method before the OAuth popup opens.
 *
 * @param config - Login configuration
 * @returns Promise resolving to token response
 * @throws Error if modal is closed or login fails
 *
 * @example
 * ```typescript
 * import { loginWithEmbedded } from '@imtbl/auth';
 *
 * const tokens = await loginWithEmbedded({
 *   clientId: 'your-client-id',
 *   redirectUri: 'https://your-app.com/callback',
 * });
 * console.log(tokens.accessToken);
 * ```
 */
export async function loginWithEmbedded(
  config: LoginConfig,
): Promise<TokenResponse> {
  track('passport', 'standaloneLoginWithEmbedded');

  const authDomain = getAuthDomain(config);

  // Display the embedded login prompt modal
  const embeddedResult = await displayEmbeddedLoginPrompt(authDomain, config.clientId);

  // Build login options from the embedded prompt result
  const loginOptions: StandaloneLoginOptions = {
    directLoginOptions: {
      directLoginMethod: embeddedResult.directLoginMethod,
      marketingConsentStatus: embeddedResult.marketingConsentStatus,
      ...(embeddedResult.directLoginMethod === 'email' && embeddedResult.email
        ? { email: embeddedResult.email }
        : {}),
    } as DirectLoginOptions,
  };

  // Proceed with popup login using the selected method
  return loginWithPopup(config, loginOptions);
}

/**
 * Login with redirect.
 * Redirects the current page to OAuth authentication.
 * After authentication, the user will be redirected back to your redirectUri.
 * Use `handleLoginCallback` to complete the flow.
 *
 * @param config - Login configuration
 * @param options - Optional login options (direct login, etc.)
 *
 * @example
 * ```typescript
 * import { loginWithRedirect } from '@imtbl/auth';
 *
 * // In your login button handler
 * loginWithRedirect({
 *   clientId: 'your-client-id',
 *   redirectUri: 'https://your-app.com/callback',
 * });
 * ```
 */
export async function loginWithRedirect(
  config: LoginConfig,
  options?: StandaloneLoginOptions,
): Promise<void> {
  track('passport', 'standaloneLoginWithRedirect');

  const { url, verifier, state } = await buildAuthorizationUrl(config, options);

  // Store PKCE data for callback
  savePKCEData({
    state,
    verifier,
    redirectUri: config.redirectUri,
  });

  // Redirect to authorization URL
  window.location.href = url;
}

/**
 * Handle the OAuth callback after redirect-based login.
 * Extracts the authorization code from the URL and exchanges it for tokens.
 *
 * @param config - Login configuration (must match what was used in loginWithRedirect)
 * @returns Promise resolving to token response, or undefined if not a valid callback
 *
 * @example
 * ```typescript
 * // In your callback page
 * import { handleLoginCallback } from '@imtbl/auth';
 *
 * const tokens = await handleLoginCallback({
 *   clientId: 'your-client-id',
 *   redirectUri: 'https://your-app.com/callback',
 * });
 *
 * if (tokens) {
 *   // Login successful, tokens contains accessToken, refreshToken, etc.
 *   await signIn('immutable', { tokens: JSON.stringify(tokens) });
 * }
 * ```
 */
export async function handleLoginCallback(
  config: LoginConfig,
): Promise<TokenResponse | undefined> {
  track('passport', 'standaloneHandleCallback');

  if (typeof window === 'undefined') {
    return undefined;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const returnedState = urlParams.get('state');
  const error = urlParams.get('error');
  const errorDescription = urlParams.get('error_description');

  // Check for OAuth error
  if (error) {
    throw new Error(errorDescription || error);
  }

  // No code means this isn't a callback
  if (!code) {
    return undefined;
  }

  // Get stored PKCE data
  const pkceData = getPKCEData();
  if (!pkceData) {
    throw new Error('No PKCE data found. Login may have been initiated in a different session.');
  }

  // Validate state
  if (returnedState !== pkceData.state) {
    clearPKCEData();
    throw new Error('State mismatch - possible CSRF attack');
  }

  // Exchange code for tokens
  const tokens = await exchangeCodeForTokens(
    config,
    code,
    pkceData.verifier,
    pkceData.redirectUri,
  );

  // Clear PKCE data after successful exchange
  clearPKCEData();

  return tokens;
}

// ============================================================================
// Logout Types
// ============================================================================

/**
 * Configuration for standalone logout functions
 */
export interface LogoutConfig {
  /** Your Immutable application client ID */
  clientId: string;
  /** URL to redirect to after logout completes (must be registered in your app settings) */
  logoutRedirectUri?: string;
  /** Authentication domain (default: "https://auth.immutable.com") */
  authenticationDomain?: string;
}

// ============================================================================
// Logout Functions
// ============================================================================

/**
 * Build the logout URL for federated logout.
 * This URL can be used to redirect to the auth domain's logout endpoint,
 * which clears the session on the auth server (including social provider sessions).
 *
 * @param config - Logout configuration
 * @returns The full logout URL
 *
 * @example
 * ```typescript
 * import { buildLogoutUrl } from '@imtbl/auth';
 *
 * const logoutUrl = buildLogoutUrl({
 *   clientId: 'your-client-id',
 *   logoutRedirectUri: 'https://your-app.com',
 * });
 * // => "https://auth.immutable.com/v2/logout?client_id=your-client-id&returnTo=https://your-app.com"
 * ```
 */
export function buildLogoutUrl(config: LogoutConfig): string {
  // Use internal implementation (crossSdkBridgeEnabled defaults to false for public API)
  return internalBuildLogoutUrl(config);
}

/**
 * Logout with redirect.
 * Redirects the current page to the auth domain's logout endpoint,
 * which clears the session on the auth server (including social provider sessions like Google).
 *
 * This is the recommended logout method for most applications as it ensures
 * complete session cleanup. After logout, the user will be redirected to
 * the `logoutRedirectUri` if provided.
 *
 * @param config - Logout configuration
 *
 * @example
 * ```typescript
 * import { logoutWithRedirect } from '@imtbl/auth';
 *
 * // In your logout button handler
 * logoutWithRedirect({
 *   clientId: 'your-client-id',
 *   logoutRedirectUri: 'https://your-app.com',
 * });
 * // Page will redirect to auth domain, then back to your app
 * ```
 */
export function logoutWithRedirect(config: LogoutConfig): void {
  track('passport', 'standaloneLogoutWithRedirect');

  const logoutUrl = buildLogoutUrl(config);
  window.location.href = logoutUrl;
}

/**
 * Logout silently using a hidden iframe.
 * Clears the session on the auth server without redirecting the current page.
 *
 * Note: Silent logout may not work in all browsers due to third-party cookie
 * restrictions. For more reliable session cleanup, use `logoutWithRedirect`.
 *
 * @param config - Logout configuration
 * @param timeout - Timeout in milliseconds (default: 5000)
 * @returns Promise that resolves when logout is complete or times out
 *
 * @example
 * ```typescript
 * import { logoutSilent } from '@imtbl/auth';
 *
 * try {
 *   await logoutSilent({
 *     clientId: 'your-client-id',
 *   });
 *   console.log('Logged out silently');
 * } catch (error) {
 *   console.error('Silent logout failed:', error);
 *   // Fall back to redirect logout
 * }
 * ```
 */
export async function logoutSilent(
  config: LogoutConfig,
  timeout: number = 5000,
): Promise<void> {
  track('passport', 'standaloneLogoutSilent');

  return new Promise((resolve, reject) => {
    const logoutUrl = buildLogoutUrl(config);

    // Create hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.setAttribute('aria-hidden', 'true');

    let timeoutId: ReturnType<typeof setTimeout>;
    let resolved = false;

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      iframe.remove();
    };

    const handleLoad = () => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve();
      }
    };

    const handleError = () => {
      if (!resolved) {
        resolved = true;
        cleanup();
        reject(new Error('Silent logout failed: iframe load error'));
      }
    };

    iframe.addEventListener('load', handleLoad);
    iframe.addEventListener('error', handleError);

    // Set timeout
    timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        // Resolve instead of reject on timeout - the logout request was sent,
        // we just can't confirm it completed due to cross-origin restrictions
        resolve();
      }
    }, timeout);

    // Start logout
    iframe.src = logoutUrl;
    document.body.appendChild(iframe);
  });
}
