import { Environment } from '@imtbl/config';
import { WalletModuleConfiguration } from './types';

export class WalletConfiguration {
  readonly environment: Environment;
  readonly passportDomain: string;
  readonly zkEvmRpcUrl: string;
  readonly relayerUrl: string;
  readonly indexerMrBasePath: string;
  readonly jsonRpcReferrer?: string;
  readonly forceScwDeployBeforeMessageSignature: boolean;
  readonly crossSdkBridgeEnabled: boolean;

  constructor(config: WalletModuleConfiguration) {
    this.environment = (config.baseConfig as any).environment;
    this.jsonRpcReferrer = config.jsonRpcReferrer;
    this.forceScwDeployBeforeMessageSignature = config.forceScwDeployBeforeMessageSignature || false;
    this.crossSdkBridgeEnabled = config.crossSdkBridgeEnabled || false;

    if (config.overrides) {
      this.passportDomain = config.overrides.passportDomain;
      this.zkEvmRpcUrl = config.overrides.zkEvmRpcUrl;
      this.relayerUrl = config.overrides.relayerUrl;
      this.indexerMrBasePath = config.overrides.indexerMrBasePath;
    } else {
      switch ((config.baseConfig as any).environment) {
        case Environment.PRODUCTION:
          this.passportDomain = 'https://passport.immutable.com';
          this.zkEvmRpcUrl = 'https://rpc.immutable.com';
          this.relayerUrl = 'https://api.immutable.com/relayer-mr';
          this.indexerMrBasePath = 'https://api.immutable.com';
          break;
        case Environment.SANDBOX:
          this.passportDomain = 'https://passport.sandbox.immutable.com';
          this.zkEvmRpcUrl = 'https://rpc.testnet.immutable.com';
          this.relayerUrl = 'https://api.sandbox.immutable.com/relayer-mr';
          this.indexerMrBasePath = 'https://api.sandbox.immutable.com';
          break;
        default:
          throw new Error(`Unsupported environment: ${(config.baseConfig as any).environment}`);
      }
    }
  }
}

