/**
 * Configuration for wallet operations
 * Contains concrete URLs and settings - no environment abstraction
 *
 * Note: This is a low-level configuration class. For high-level usage,
 * use Passport SDK which handles environment → URL translation.
 */
export interface WalletConfigurationParams {
  /** Passport domain URL */
  passportDomain: string;

  /** zkEVM RPC URL */
  zkEvmRpcUrl: string;

  /** Relayer URL for transaction submission */
  relayerUrl: string;

  /** Indexer/API base path */
  indexerMrBasePath: string;

  /** Optional referrer URL for JSON-RPC requests */
  jsonRpcReferrer?: string;

  /** If true, forces SCW deployment before message signature */
  forceScwDeployBeforeMessageSignature?: boolean;

  /** Cross-SDK bridge mode flag */
  crossSdkBridgeEnabled?: boolean;

  /** Preferred token symbol to use when paying relayer fees (defaults to 'IMX') */
  feeTokenSymbol?: string;
}

export class WalletConfiguration {
  readonly passportDomain: string;

  readonly zkEvmRpcUrl: string;

  readonly relayerUrl: string;

  readonly indexerMrBasePath: string;

  readonly jsonRpcReferrer?: string;

  readonly forceScwDeployBeforeMessageSignature: boolean;

  readonly crossSdkBridgeEnabled: boolean;

  readonly feeTokenSymbol: string;

  constructor(params: WalletConfigurationParams) {
    this.passportDomain = params.passportDomain;
    this.zkEvmRpcUrl = params.zkEvmRpcUrl;
    this.relayerUrl = params.relayerUrl;
    this.indexerMrBasePath = params.indexerMrBasePath;
    this.jsonRpcReferrer = params.jsonRpcReferrer;
    this.forceScwDeployBeforeMessageSignature = params.forceScwDeployBeforeMessageSignature || false;
    this.crossSdkBridgeEnabled = params.crossSdkBridgeEnabled || false;
    this.feeTokenSymbol = params.feeTokenSymbol || 'IMX';
  }
}
