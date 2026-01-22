import {
  Auth,
  TypedEventEmitter,
} from '@imtbl/auth';
import {
  MultiRollupApiClients,
  MagicTeeApiClients,
  createConfig,
  mr,
} from '@imtbl/generated-clients';
import { ZkEvmProvider } from './zkEvm/zkEvmProvider';
import {
  ConnectWalletOptions, WalletEventMap, ChainConfig, GetUserFunction,
} from './types';
import { WalletConfiguration } from './config';
import GuardianClient from './guardian';
import MagicTEESigner from './magic/magicTEESigner';
import { announceProvider, passportProviderInfo } from './provider/eip6963';
import { DEFAULT_CHAINS } from './presets';
import { MAGIC_CONFIG, IMMUTABLE_ZKEVM_TESTNET_CHAIN_ID } from './constants';

/**
 * Type guard to check if chainId is a valid key for MAGIC_CONFIG
 */
function isValidMagicChainId(chainId: number): chainId is keyof typeof MAGIC_CONFIG {
  return chainId in MAGIC_CONFIG;
}

/**
 * Get Magic configuration for a specific chain
 * Prioritizes chain-specific config (for dev/custom environments),
 * falls back to hard-coded defaults for standard chains
 * @internal
 */
function getMagicConfigForChain(chain: ChainConfig): {
  magicPublishableApiKey: string;
  magicProviderId: string;
} {
  // 1. Use chain-specific magic config if provided (dev/custom environments)
  if (chain.magicPublishableApiKey && chain.magicProviderId) {
    return {
      magicPublishableApiKey: chain.magicPublishableApiKey,
      magicProviderId: chain.magicProviderId,
    };
  }

  // 2. Fallback to hard-coded defaults for standard chains (prod/sandbox)
  const { chainId } = chain;
  if (isValidMagicChainId(chainId)) {
    return MAGIC_CONFIG[chainId];
  }

  // 3. Error for unknown chains without magic config
  throw new Error(
    `No Magic configuration available for chain ${chain.chainId}. `
    + 'Please provide magicPublishableApiKey and magicProviderId in ChainConfig.',
  );
}

const DEFAULT_PRODUCTION_CLIENT_ID = 'PtQRK4iRJ8GkXjiz6xfImMAYhPhW0cYk';
const DEFAULT_SANDBOX_CLIENT_ID = 'mjtCL8mt06BtbxSkp2vbrYStKWnXVZfo';
const DEFAULT_AUTH_SCOPE = 'openid profile email offline_access transact';
const DEFAULT_AUTH_AUDIENCE = 'platform_api';
const DEFAULT_REDIRECT_FALLBACK = 'https://auth.immutable.com/im-logged-in';
const DEFAULT_AUTHENTICATION_DOMAIN = 'https://auth.immutable.com';
const SANDBOX_DOMAIN_REGEX = /(sandbox|testnet)/i;

function isSandboxChain(chain: ChainConfig): boolean {
  if (chain.chainId === IMMUTABLE_ZKEVM_TESTNET_CHAIN_ID) {
    return true;
  }

  const domainCandidate = chain.apiUrl || chain.passportDomain || '';
  return SANDBOX_DOMAIN_REGEX.test(domainCandidate);
}

function derivePassportDomain(chain: ChainConfig): string {
  if (chain.passportDomain) {
    return chain.passportDomain;
  }

  if (chain.apiUrl) {
    try {
      const apiUrl = new URL(chain.apiUrl);
      const updatedHost = apiUrl.hostname.replace('api.', 'passport.');
      return `${apiUrl.protocol}//${updatedHost}`;
    } catch {
      return chain.apiUrl.replace('api.', 'passport.');
    }
  }

  return 'https://passport.immutable.com';
}

function deriveAuthenticationDomain(): string {
  return DEFAULT_AUTHENTICATION_DOMAIN;
}

function deriveRedirectUri(): string {
  return DEFAULT_REDIRECT_FALLBACK;
}

function getDefaultClientId(chain: ChainConfig): string {
  return isSandboxChain(chain) ? DEFAULT_SANDBOX_CLIENT_ID : DEFAULT_PRODUCTION_CLIENT_ID;
}

/**
 * Create a default getUser function using internal Auth instance.
 * This is used when no external getUser is provided.
 * @internal
 */
function createDefaultGetUser(initialChain: ChainConfig, options: ConnectWalletOptions): {
  getUser: GetUserFunction;
  clientId: string;
} {
  const passportDomain = derivePassportDomain(initialChain);
  const authenticationDomain = deriveAuthenticationDomain();
  const redirectUri = deriveRedirectUri();
  const clientId = options.clientId || getDefaultClientId(initialChain);

  const auth = new Auth({
    clientId,
    redirectUri,
    popupRedirectUri: redirectUri,
    logoutRedirectUri: redirectUri,
    scope: DEFAULT_AUTH_SCOPE,
    audience: DEFAULT_AUTH_AUDIENCE,
    authenticationDomain,
    passportDomain,
    popupOverlayOptions: options.popupOverlayOptions,
    crossSdkBridgeEnabled: options.crossSdkBridgeEnabled,
  });

  // Set up message listener for popup login callback
  if (typeof window !== 'undefined') {
    window.addEventListener('message', async (event) => {
      if (event.data.code && event.data.state) {
        const currentQueryString = window.location.search;
        const newQueryString = new URLSearchParams(currentQueryString);
        newQueryString.set('code', event.data.code);
        newQueryString.set('state', event.data.state);
        window.history.replaceState(null, '', `?${newQueryString.toString()}`);
        await auth.loginCallback();
        newQueryString.delete('code');
        newQueryString.delete('state');
        window.history.replaceState(null, '', `?${newQueryString.toString()}`);
      }
    });
  }

  // Return getUser function that wraps Auth.getUserOrLogin
  return {
    getUser: async () => auth.getUserOrLogin(),
    clientId,
  };
}

/**
 * Connect wallet with the provided configuration
 *
 * @param config - Wallet configuration
 * @returns EIP-1193 compliant provider with multi-chain support
 *
 * If getUser is not provided, a default implementation using @imtbl/auth will be created.
 *
 * @example Using external auth (e.g., NextAuth)
 * ```typescript
 * import { connectWallet } from '@imtbl/wallet';
 * import { useImmutableSession } from '@imtbl/auth-next-client';
 *
 * const { getUser } = useImmutableSession();
 * const provider = await connectWallet({ getUser });
 * ```
 *
 * @example Using default auth (simplest setup)
 * ```typescript
 * import { connectWallet } from '@imtbl/wallet';
 *
 * // Uses default Immutable-hosted authentication
 * const provider = await connectWallet();
 * const accounts = await provider.request({ method: 'eth_requestAccounts' });
 * ```
 */
export async function connectWallet(
  config: ConnectWalletOptions = {},
): Promise<ZkEvmProvider> {
  // Use default chains if not provided (testnet + mainnet)
  const chains = config.chains && config.chains.length > 0
    ? config.chains
    : DEFAULT_CHAINS;

  // Default to first chain (testnet by default)
  const initialChainId = config.initialChainId || chains[0].chainId;
  const initialChain = chains.find((c) => c.chainId === initialChainId);

  if (!initialChain) {
    throw new Error(`Initial chain ${initialChainId} not found in chains configuration`);
  }

  // 1. Create basic configuration for the APIs
  const apiConfig = createConfig({ basePath: initialChain.apiUrl });

  // 2. Create MultiRollupApiClients
  const multiRollupApiClients = new MultiRollupApiClients({
    indexer: apiConfig,
    orderBook: apiConfig,
    passport: apiConfig,
  });

  // 3. Resolve getUser function
  // If not provided, create a default implementation using internal Auth
  let getUser: GetUserFunction;
  let clientId: string;

  if (config.getUser) {
    getUser = config.getUser;
    clientId = config.clientId || getDefaultClientId(initialChain);
  } else {
    // Create default getUser using internal Auth
    const defaultAuth = createDefaultGetUser(initialChain, config);
    getUser = defaultAuth.getUser;
    clientId = defaultAuth.clientId;
  }

  // 4. Get current user (may be null if not logged in)
  const user = await getUser().catch(() => null);

  // 5. Create wallet configuration with concrete URLs
  const passportDomain = initialChain.passportDomain || initialChain.apiUrl.replace('api.', 'passport.');
  const walletConfig = new WalletConfiguration({
    passportDomain,
    zkEvmRpcUrl: initialChain.rpcUrl,
    relayerUrl: initialChain.relayerUrl,
    indexerMrBasePath: initialChain.apiUrl,
    jsonRpcReferrer: config.jsonRpcReferrer,
    forceScwDeployBeforeMessageSignature: config.forceScwDeployBeforeMessageSignature,
    crossSdkBridgeEnabled: config.crossSdkBridgeEnabled,
    feeTokenSymbol: config.feeTokenSymbol,
  });

  // 6. Create GuardianClient
  const guardianApi = new mr.GuardianApi(apiConfig);

  const guardianClient = new GuardianClient({
    config: walletConfig,
    getUser,
    guardianApi,
    passportDomain,
    clientId,
  });

  // 7. Get Magic config for initial chain (from chain config or hard-coded default)
  const magicConfig = getMagicConfigForChain(initialChain);

  // 8. Create MagicTEESigner with Magic TEE base path (separate from backend API)
  const magicTeeBasePath = initialChain.magicTeeBasePath || 'https://tee.express.magiclabs.com';
  const magicTeeApiClients = new MagicTeeApiClients({
    basePath: magicTeeBasePath,
    timeout: 10000,
    magicPublishableApiKey: magicConfig.magicPublishableApiKey,
    magicProviderId: magicConfig.magicProviderId,
  });

  // Create MagicTEESigner with getUser
  const ethSigner = new MagicTEESigner(getUser, magicTeeApiClients);

  // 9. Determine session activity API URL (only for mainnet, testnet, devnet)
  let sessionActivityApiUrl: string | null = null;
  if (initialChain.chainId === 13371) {
    // Mainnet
    sessionActivityApiUrl = 'https://api.immutable.com';
  } else if (initialChain.chainId === 13473) {
    // Testnet
    sessionActivityApiUrl = 'https://api.sandbox.immutable.com';
  } else if (initialChain.apiUrl) {
    // Devnet - use the apiUrl from chain config
    sessionActivityApiUrl = initialChain.apiUrl;
  }
  // For any other chain, sessionActivityApiUrl remains null (no session activity tracking)

  // 10. Create WalletEventEmitter
  const walletEventEmitter = config.passportEventEmitter || new TypedEventEmitter<WalletEventMap>();

  // 11. Create ZkEvmProvider
  const provider = new ZkEvmProvider({
    getUser,
    clientId,
    config: walletConfig,
    multiRollupApiClients,
    walletEventEmitter,
    guardianClient,
    ethSigner,
    user,
    sessionActivityApiUrl,
  });

  // 12. Announce provider via EIP-6963
  if (config.announceProvider !== false) {
    announceProvider({
      info: passportProviderInfo,
      provider,
    });
  }

  return provider;
}
