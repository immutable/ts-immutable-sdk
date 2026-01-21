import {
  Auth,
  IAuthConfiguration,
  TypedEventEmitter,
} from '@imtbl/auth';
import {
  MultiRollupApiClients,
  MagicTeeApiClients,
  createConfig,
  mr,
} from '@imtbl/generated-clients';
import { ZkEvmProvider } from './zkEvm/zkEvmProvider';
import { SequenceProvider } from './sequence/sequenceProvider';
import {
  ConnectWalletOptions, PassportEventMap, ChainConfig, Provider,
} from './types';
import { WalletConfiguration } from './config';
import GuardianClient from './guardian';
import MagicTEESigner from './magic/magicTEESigner';
import { announceProvider, passportProviderInfo } from './provider/eip6963';
import { DEFAULT_CHAINS } from './presets';
import {
  MAGIC_CONFIG,
  IMMUTABLE_ZKEVM_TESTNET_CHAIN_ID,
} from './constants';

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

function isZkEvmChain(chain: ChainConfig): boolean {
  // Only zkEVM chains use magic
  return !!chain.magicPublishableApiKey || isValidMagicChainId(chain.chainId);
}

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

function createDefaultAuth(initialChain: ChainConfig, options: ConnectWalletOptions): Auth {
  const passportDomain = derivePassportDomain(initialChain);
  const authenticationDomain = deriveAuthenticationDomain();
  const redirectUri = deriveRedirectUri();

  return new Auth({
    clientId: getDefaultClientId(initialChain),
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
}

/**
 * Connect wallet with the provided configuration
 *
 * @param config - Wallet configuration
 * @returns EIP-1193 compliant provider with multi-chain support
 *
 * If no Auth instance is provided, a default Immutable-hosted client id will be used.
 *
 * @example
 * ```typescript
 * import { Auth } from '@imtbl/auth';
 * import { connectWallet, IMMUTABLE_ZKEVM_MAINNET_CHAIN } from '@imtbl/wallet';
 *
 * // Create auth
 * const auth = new Auth({
 *   authenticationDomain: 'https://auth.immutable.com',
 *   passportDomain: 'https://passport.immutable.com',
 *   clientId: 'your-client-id',
 *   redirectUri: 'https://your-app.com/callback',
 *   scope: 'openid profile email offline_access transact',
 * });
 *
 * // Connect wallet (defaults to testnet + mainnet, starts on testnet)
 * const provider = await connectWallet({ auth });
 *
 * // Or specify a single chain
 * const provider = await connectWallet({
 *   auth,
 *   chains: [IMMUTABLE_ZKEVM_MAINNET_CHAIN],
 * });
 * ```
 */
export async function connectWallet(
  config: ConnectWalletOptions = {},
): Promise<Provider> {
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

  // 3. Resolve Auth (use provided instance or create a default)
  const auth = config.auth ?? createDefaultAuth(initialChain, config);
  if (!config.auth && typeof window !== 'undefined') {
    window.addEventListener('message', async (event) => {
      if (event.data.code && event.data.state) {
        // append to the current querystring making sure both cases of no existing and having existing params are handled
        const currentQueryString = window.location.search;
        const newQueryString = new URLSearchParams(currentQueryString);
        newQueryString.set('code', event.data.code);
        newQueryString.set('state', event.data.state);
        window.history.replaceState(null, '', `?${newQueryString.toString()}`);
        await auth.loginCallback();
        // remove the code and state from the querystring
        newQueryString.delete('code');
        newQueryString.delete('state');
        window.history.replaceState(null, '', `?${newQueryString.toString()}`);
      }
    });
  }

  // 4. Extract Auth configuration and current user
  const authConfig: IAuthConfiguration = auth.getConfig();
  const user = await auth.getUser();

  // 5. Create wallet configuration with concrete URLs
  const walletConfig = new WalletConfiguration({
    passportDomain: initialChain.passportDomain || initialChain.apiUrl.replace('api.', 'passport.'),
    zkEvmRpcUrl: initialChain.rpcUrl,
    relayerUrl: initialChain.relayerUrl,
    indexerMrBasePath: initialChain.apiUrl,
    jsonRpcReferrer: config.jsonRpcReferrer,
    forceScwDeployBeforeMessageSignature: config.forceScwDeployBeforeMessageSignature,
    crossSdkBridgeEnabled: config.crossSdkBridgeEnabled,
    feeTokenSymbol: config.feeTokenSymbol,
  });

  // 6. Create PassportEventEmitter
  const passportEventEmitter = config.passportEventEmitter || new TypedEventEmitter<PassportEventMap>();

  // 7. Create GuardianClient
  const guardianApi = new mr.GuardianApi(apiConfig);

  const guardianClient = new GuardianClient({
    config: walletConfig,
    auth,
    guardianApi,
    authConfig,
  });

  // 8. Create provider based on chain type
  let provider: Provider;

  if (isZkEvmChain(initialChain)) {
    // 9. Get Magic config for initial chain (from chain config or hard-coded default)
    const magicConfig = getMagicConfigForChain(initialChain);

    // 10. Create MagicTEESigner with Magic TEE base path (separate from backend API)
    const magicTeeBasePath = initialChain.magicTeeBasePath || 'https://tee.express.magiclabs.com';
    const magicTeeApiClients = new MagicTeeApiClients({
      basePath: magicTeeBasePath,
      timeout: 10000,
      magicPublishableApiKey: magicConfig.magicPublishableApiKey,
      magicProviderId: magicConfig.magicProviderId,
    });
    const ethSigner = new MagicTEESigner(auth, magicTeeApiClients);

    // 11. Determine session activity API URL (only for mainnet, testnet, devnet)
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

    // 12. Create ZkEvmProvider
    provider = new ZkEvmProvider({
      auth,
      config: walletConfig,
      multiRollupApiClients,
      passportEventEmitter,
      guardianClient,
      ethSigner,
      user,
      sessionActivityApiUrl,
    });
  } else {
    // Non-zkEVM chain - use SequenceProvider
    provider = new SequenceProvider({
      chainConfig: initialChain,
      guardianClient,
    });
  }

  // 13. Announce provider via EIP-6963
  if (config.announceProvider !== false) {
    announceProvider({
      info: passportProviderInfo,
      provider,
    });
  }

  return provider;
}
