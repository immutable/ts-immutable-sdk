import { Environment, ImmutableConfiguration } from '@imtbl/config';
import {
  ETH_MAINNET_TO_ZKEVM_MAINNET,
  ETH_SEPOLIA_TO_ZKEVM_DEVNET,
  ETH_SEPOLIA_TO_ZKEVM_LOCAL,
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
const SUPPORTED_SANDBOX_BRIDGES: BridgeInstance[] = [ETH_SEPOLIA_TO_ZKEVM_DEVNET, ETH_SEPOLIA_TO_ZKEVM_LOCAL];

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
    rootChainERC20Predicate: '0x54A3B143E6F18f3B6f4416492570249a72cDAd9C',
    rootChainStateSender: '0xa66C24ef810CBa2660B6bbF055588CE07574896F',
    childChainERC20Predicate: '0x0000000000000000000000000000000000001004',
    childChainStateReceiver: '0x0000000000000000000000000000000000001001',
  })
  .set(ETH_MAINNET_TO_ZKEVM_MAINNET, {
    rootChainERC20Predicate: '0x',
    rootChainStateSender: '0x',
    childChainERC20Predicate: '0x',
    childChainStateReceiver: '0x',
  }).set(ETH_SEPOLIA_TO_ZKEVM_LOCAL, {
    rootChainERC20Predicate: '0x453f079Ae4dD021B54d396a54E4D29a6894104A5',
    rootChainStateSender: '0x6CBA18c18e1dc0867dA98201F6a0975873F4893C',
    childChainERC20Predicate: '0x0000000000000000000000000000000000001004',
    childChainStateReceiver: '0x0000000000000000000000000000000000001001',
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
   * @property {number} blockTime - The approximate block time
   * @property {number} pollInterval - The time to wait between polls to the blockchain
   * @property {number} maxDepositBlockDelay - The maximum number of blocks it should take on child chain for deposit to be observed
   * @property {number} clockInaccuracy - The maximum number of seconds of inaccuracy of blockchain timestamps
   * @property {number} rootChainFinalityBlocks - The number of blocks to wait for on the rootchain before accepting finality
  */
  public baseConfig: ImmutableConfiguration;

  public bridgeInstance: BridgeInstance;

  public bridgeContracts: BridgeContracts;

  public rootProvider: ethers.providers.Provider;

  public childProvider: ethers.providers.Provider;

  public blockTime: number;

  public pollInterval: number;

  public maxDepositBlockDelay: number;

  public clockInaccuracy: number;

  public rootChainFinalityBlocks: number;

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

    // Does not need to be exact, just approximate
    this.blockTime = 12;
    // How frequently we poll the childchain for StateSync events
    this.pollInterval = 5 * 1000; // 5 seconds
    // The upper bound of the block range we poll for StateSync events
    this.maxDepositBlockDelay = 250;
    // Assume that the clock timestamp is at most 900 seconds inaccurate, see for more -> https://github.com/ethereum/wiki/blob/c02254611f218f43cbb07517ca8e5d00fd6d6d75/Block-Protocol-2.0.md
    this.clockInaccuracy = 900;
    // How many blocks to wait for on the root chain before accepting rootchain finality
    this.rootChainFinalityBlocks = 3;

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
