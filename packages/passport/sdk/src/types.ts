import { Environment, ModuleConfiguration } from '@imtbl/config';
import { IMXClient } from '@imtbl/x-client';
import { ImxApiClients } from '@imtbl/generated-clients';
import { Flow } from '@imtbl/metrics';

/**
 * Direct login method identifier
 * Known providers: 'google', 'apple', 'facebook'
 * Additional providers may be supported server-side
 */
export type DirectLoginMethod = string;

// Re-export events from auth and wallet
export { AuthEvents } from '@imtbl/auth';
export { WalletEvents } from '@imtbl/wallet';

export type AccountsRequestedEvent = {
  environment: Environment;
  sendTransaction: (params: Array<any>, flow: Flow) => Promise<string>;
  walletAddress: string;
  passportClient: string;
  flow?: Flow;
};

export type {
  User,
  UserProfile,
  DeviceTokenResponse,
  IdTokenPayload,
} from '@imtbl/auth';
export { isUserZkEvm } from '@imtbl/auth';
export type { UserImx } from './utils/imxUser';

export interface OidcConfiguration {
  clientId: string;
  logoutRedirectUri?: string;
  logoutMode?: 'redirect' | 'silent';
  redirectUri: string;
  popupRedirectUri?: string;
  scope?: string;
  audience?: string;
}

export interface PassportOverrides {
  authenticationDomain: string;
  magicPublishableApiKey: string;
  magicProviderId: string;
  passportDomain: string;
  imxPublicApiDomain: string;
  immutableXClient: IMXClient;
  zkEvmRpcUrl: string;
  relayerUrl: string;
  indexerMrBasePath: string;
  orderBookMrBasePath: string;
  passportMrBasePath: string;
  imxApiClients?: ImxApiClients; // needs to be optional because ImxApiClients is not exposed publicly

  /**
   * Custom chain ID for dev environments (optional)
   * If provided, overrides the default chainId based on environment
   */
  zkEvmChainId?: number;

  /**
   * Custom chain name for dev environments (optional)
   * Used when zkEvmChainId is provided
   */
  zkEvmChainName?: string;

  /**
   * Magic TEE base path (optional, for dev/custom environments)
   * Defaults to 'https://tee.express.magiclabs.com'
   */
  magicTeeBasePath?: string;
}

export interface PopupOverlayOptions {
  disableGenericPopupOverlay?: boolean;
  disableBlockedPopupOverlay?: boolean;
  disableHeadlessLoginPromptOverlay?: boolean;
}

export interface PassportModuleConfiguration
  extends ModuleConfiguration<PassportOverrides>,
  OidcConfiguration {
  /**
   * This flag indicates that Passport is being used in a cross-sdk bridge scenario
   * and not directly on the web.
   */
  crossSdkBridgeEnabled?: boolean;

  /**
   * Optional referrer URL to be sent with JSON-RPC requests.
   * If specified, this value will be passed as the referrer in fetch options.
   */
  jsonRpcReferrer?: string;

  /**
   * Options for disabling the Passport popup overlays.
   */
  popupOverlayOptions?: PopupOverlayOptions;

  /**
   * This flag controls whether a deploy transaction is sent before signing an ERC191 message.
   *
   * @default false - By default, this behavior is disabled and the user will not be asked
   * to approve a deploy transaction before signing.
   */
  forceScwDeployBeforeMessageSignature?: boolean;
}

export type TokenPayload = {
  exp?: number;
};

export type PKCEData = {
  state: string;
  verifier: string;
};

// Re-export wallet linking types from wallet package
export type { LinkWalletParams, LinkedWallet } from '@imtbl/wallet';

export type ConnectEvmArguments = {
  announceProvider: boolean;
};

// Export ZkEvmProvider for return type
export type { ZkEvmProvider } from '@imtbl/wallet';

export type LoginArguments = {
  useCachedSession?: boolean;
  anonymousId?: string;
  useSilentLogin?: boolean;
  useRedirectFlow?: boolean;
  directLoginOptions?: DirectLoginOptions;
};

export enum MarketingConsentStatus {
  OptedIn = 'opted_in',
  Unsubscribed = 'unsubscribed',
}

export type DirectLoginOptions = {
  marketingConsentStatus: MarketingConsentStatus;
} & (
  | { directLoginMethod: 'email'; email: string }
  | { directLoginMethod: Exclude<DirectLoginMethod, 'email'>; email?: never }
);
