import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { Provider } from 'ethers';
import {
  ETH_MAINNET_TO_ZKEVM_MAINNET,
  ETH_SEPOLIA_TO_ZKEVM_DEVNET,
  ETH_SEPOLIA_TO_ZKEVM_TESTNET,
} from '../constants/bridges';
import {
  BridgeContracts,
  BridgeInstance,
  BridgeModuleConfiguration,
} from '../types';

/**
 * @constant {BridgeInstance[]} SupportedSandboxBridges - An array of supported bridge instances for the sandbox environment.
 */
const SUPPORTED_SANDBOX_BRIDGES: BridgeInstance[] = [ETH_SEPOLIA_TO_ZKEVM_DEVNET, ETH_SEPOLIA_TO_ZKEVM_TESTNET];

/**
 * @constant {BridgeInstance[]} SUPPORTED_PRODUCTION_BRIDGES - An array of supported bridge instances for the production environment.
 */
const SUPPORTED_PRODUCTION_BRIDGES: BridgeInstance[] = [ETH_MAINNET_TO_ZKEVM_MAINNET];

/**
 * @constant {Object} SUPPORTED_BRIDGES_FOR_ENVIRONMENT - An object mapping environment types to their supported bridge instances.
 */
export const SUPPORTED_BRIDGES_FOR_ENVIRONMENT: {
  [key in Environment]: BridgeInstance[];
} = {
  [Environment.SANDBOX]: SUPPORTED_SANDBOX_BRIDGES,
  [Environment.PRODUCTION]: SUPPORTED_PRODUCTION_BRIDGES,
};

// @TODO update the childChainERC20Bridge and rootChainERC20BridgeFlowRate when available
//  and remove any unused addresses

/**
 * @constant {Map<BridgeInstance, BridgeContracts>} CONTRACTS_FOR_BRIDGE - A map of bridge instances to their associated contract addresses.
 */
const CONTRACTS_FOR_BRIDGE = new Map<BridgeInstance, BridgeContracts>()
  .set(ETH_SEPOLIA_TO_ZKEVM_DEVNET, {
    rootERC20BridgeFlowRate: '0x0',
    childERC20Bridge: '0x0',
    rootChainIMX: '0x0',
    rootChainWrappedETH: '0x0',
    childChainWrappedETH: '0x0',
    childChainWrappedIMX: '0x0',
  })
  .set(ETH_SEPOLIA_TO_ZKEVM_TESTNET, {
    rootERC20BridgeFlowRate: '0x0D3C59c779Fd552C27b23F723E80246c840100F5',
    childERC20Bridge: '0x0D3C59c779Fd552C27b23F723E80246c840100F5',
    rootChainIMX: '0xe2629e08f4125d14e446660028bD98ee60EE69F2',
    rootChainWrappedETH: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    childChainWrappedETH: '0xe9E96d1aad82562b7588F03f49aD34186f996478',
    childChainWrappedIMX: '0x1CcCa691501174B4A623CeDA58cC8f1a76dc3439',
  })
  .set(ETH_MAINNET_TO_ZKEVM_MAINNET, {
    rootERC20BridgeFlowRate: '0xBa5E35E26Ae59c7aea6F029B68c6460De2d13eB6',
    childERC20Bridge: '0xBa5E35E26Ae59c7aea6F029B68c6460De2d13eB6',
    rootChainIMX: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
    rootChainWrappedETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    childChainWrappedETH: '0x52a6c53869ce09a731cd772f245b97a4401d3348',
    childChainWrappedIMX: '0x3a0c2ba54d6cbd3121f01b96dfd20e99d1696c9d',
  });

/**
 * Represents the configuration for a bridge between two chains.
 */
export class BridgeConfiguration {
  /**
   * @property {ImmutableConfiguration} baseConfig - The base configuration for the module.
   * @property {BridgeInstance} bridgeInstance - The bridge instance configuration for the root and child chains.
   * @property {BridgeContracts} bridgeContracts - The configuration of the contracts associated with the bridge.
   * @property {Provider} rootProvider - The Ethereum provider for the root chain.
   * @property {Provider} childProvider - The Ethereum provider for the child chain.
  */
  public baseConfig: ImmutableConfiguration;

  public bridgeInstance: BridgeInstance;

  public bridgeContracts: BridgeContracts;

  public rootProvider: Provider;

  public childProvider: Provider;

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
