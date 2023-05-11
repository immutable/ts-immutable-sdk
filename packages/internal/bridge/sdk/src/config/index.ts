import { Environment, ImmutableConfiguration } from '@imtbl/config';
import {
  ETH_MAINNET_TO_ZKEVM_MAINNET,
  ETH_SEPOLIA_TO_ZKEVM_DEVNET,
} from 'constants/bridges';
import { ethers } from 'ethers';
import {
  BridgeContracts,
  BridgeInstance,
  BridgeModuleConfiguration,
} from '../types';

/**
 * @constant {BridgeInstance[]} SupportedSandboxBridges - An array of supported bridge instances for the sandbox environment.
 */
const SUPPORTED_SANDBOX_BRIDGES: BridgeInstance[] = [ETH_SEPOLIA_TO_ZKEVM_DEVNET];

/**
 * @constant {BridgeInstance[]} SUPPORTED_PRODUCTION_BRIDGES - An array of supported bridge instances for the production environment.
 */
const SUPPORTED_PRODUCTION_BRIDGES: BridgeInstance[] = [];

/**
 * @constant {Object} SUPPORTED_BRIDGES_FOR_ENVIRONMENT - An object mapping environment types to their supported bridge instances.
 */
export const SUPPORTED_BRIDGES_FOR_ENVIRONMENT: {
  [key in Environment]: BridgeInstance[];
} = {
  [Environment.SANDBOX]: SUPPORTED_SANDBOX_BRIDGES,
  [Environment.PRODUCTION]: SUPPORTED_PRODUCTION_BRIDGES,
};

/**
 * @constant {Map<BridgeInstance, BridgeContracts>} CONTRACTS_FOR_BRIDGE - A map of bridge instances to their associated contract addresses.
 */
const CONTRACTS_FOR_BRIDGE = new Map<BridgeInstance, BridgeContracts>()
  .set(ETH_SEPOLIA_TO_ZKEVM_DEVNET, {
    rootChainERC20Predicate: '0xA401eA44cDAc48569322b1166A0696b9412977D9',
    rootChainStateSender: '0xA002CfC25D1DDdE53FBD5d8bCF8E26c821B87ceD',
    childChainERC20Predicate: '0x0000000000000000000000000000000000001004',
    childChainStateReceiver: '0x0000000000000000000000000000000000001001',
  })
  .set(ETH_MAINNET_TO_ZKEVM_MAINNET, {
    rootChainERC20Predicate: '0x',
    rootChainStateSender: '0x',
    childChainERC20Predicate: '0x',
    childChainStateReceiver: '0x',
  });

/**
 * Represents the configuration for a bridge between two chains.
 */
export class BridgeConfiguration {
  /**
   * @property {ImmutableConfiguration} baseConfig - The base configuration for the module.
   * @property {BridgeInstance} bridgeInstance - The bridge instance configuration for the root and child chains.
   * @property {BridgeContracts} bridgeContracts - The configuration of the contracts associated with the bridge.
   * @property {ethers.providers.Provider} rootProvider - The Ethereum provider for the root chain.
   * @property {ethers.providers.Provider} childProvider - The Ethereum provider for the child chain.
   */
  public baseConfig: ImmutableConfiguration;

  public bridgeInstance: BridgeInstance;

  public bridgeContracts: BridgeContracts;

  public rootProvider: ethers.providers.Provider;

  public childProvider: ethers.providers.Provider;

  /**
   * Constructs a BridgeConfiguration instance.
   *
   * @param {BridgeModuleConfiguration} options - The configuration options for the bridge module.
   */
  constructor({
    bridgeInstance,
    rootProvider,
    childProvider,
    baseConfig,
    overrides,
  }: BridgeModuleConfiguration) {
    this.baseConfig = baseConfig;
    this.bridgeInstance = bridgeInstance;
    this.rootProvider = rootProvider;
    this.childProvider = childProvider;

    if (overrides) {
      this.bridgeContracts = overrides.bridgeContracts;
      return;
    }

    const supported = SUPPORTED_BRIDGES_FOR_ENVIRONMENT[baseConfig.environment].includes(
      bridgeInstance,
    );
    if (!supported) {
      throw new Error(
        `Bridge instance with rootchain ${bridgeInstance.rootChainID} and childchain ${bridgeInstance.childChainID} is not supported in environment ${baseConfig.environment}`,
      );
    }
    if (!CONTRACTS_FOR_BRIDGE.has(bridgeInstance)) {
      throw new Error(
        `Bridge instance with rootchain ${bridgeInstance.rootChainID} and childchain ${bridgeInstance.childChainID} is not supported in environment ${baseConfig.environment}`,
      );
    }
    const bridgeContracts = CONTRACTS_FOR_BRIDGE.get(bridgeInstance);
    if (!bridgeContracts) {
      throw new Error(
        `Bridge instance with rootchain ${bridgeInstance.rootChainID} and childchain ${bridgeInstance.childChainID} is not supported in environment ${baseConfig.environment}`,
      );
    }
    this.bridgeContracts = bridgeContracts;
  }
}
