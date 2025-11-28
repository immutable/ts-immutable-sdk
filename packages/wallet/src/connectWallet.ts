import { IAuthConfiguration, TypedEventEmitter } from '@imtbl/auth';
import {
  MultiRollupApiClients,
  MagicTeeApiClients,
  createConfig,
  mr,
} from '@imtbl/generated-clients';
import { ZkEvmProvider } from './zkEvm/zkEvmProvider';
import { ConnectWalletOptions, PassportEventMap, ChainConfig } from './types';
import { WalletConfiguration } from './config';
import GuardianClient from './guardian';
import MagicTEESigner from './magic/magicTEESigner';
import { announceProvider, passportProviderInfo } from './provider/eip6963';
import { DEFAULT_CHAINS } from './presets';
import { MAGIC_CONFIG } from './constants';

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

/**
 * Connect wallet with the provided configuration
 *
 * @param config - Wallet configuration
 * @returns EIP-1193 compliant provider with multi-chain support
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
 *   scope: 'openid profile email transact',
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
export async function connectWallet(config: ConnectWalletOptions): Promise<ZkEvmProvider> {
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

  // 3. Extract Auth configuration
  const authConfig: IAuthConfiguration = config.auth.getConfig();

  // 4. Get current user
  const user = await config.auth.getUser();

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

  // 6. Create GuardianClient
  const guardianApi = new mr.GuardianApi(apiConfig);

  const guardianClient = new GuardianClient({
    config: walletConfig,
    auth: config.auth,
    guardianApi,
    authConfig,
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

  const ethSigner = new MagicTEESigner(config.auth, magicTeeApiClients);

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

  // 10. Create PassportEventEmitter
  const passportEventEmitter = config.passportEventEmitter || new TypedEventEmitter<PassportEventMap>();

  // 11. Create ZkEvmProvider
  const provider = new ZkEvmProvider({
    auth: config.auth,
    config: walletConfig,
    multiRollupApiClients,
    passportEventEmitter,
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
