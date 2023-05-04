import { Environment, ImmutableConfiguration } from '@imtbl/config';
import {
  ETH_MAINNET_TO_ZKEVM_MAINNET,
  ETH_SEPOLIA_TO_ZKEVM_DEVNET,
} from 'constants/bridges';
import {
  BridgeContracts,
  BridgeInstance,
  BridgeModuleConfiguration,
} from '../types';

export class BridgeConfiguration {
  public baseConfig: ImmutableConfiguration;

  public bridgeInstance: BridgeInstance;

  public bridgeContracts: BridgeContracts;

  constructor({
    bridgeInstance,
    baseConfig,
    overrides,
  }: BridgeModuleConfiguration) {
    this.baseConfig = baseConfig;
    this.bridgeInstance = bridgeInstance;

    if (overrides) {
      this.bridgeContracts = overrides.bridgeContracts;
      return;
    }

    const supported = SupportedBridgesForEnvironment[baseConfig.environment].includes(
      bridgeInstance,
    );
    if (!supported) {
      throw new Error(
        `Bridge instance with rootchain ${bridgeInstance.rootChainID} and childchain ${bridgeInstance.childChainID} is not supported in environment ${baseConfig.environment}`,
      );
    }
    if (!ContractsForBridge.has(bridgeInstance)) {
      throw new Error(
        `Bridge instance with rootchain ${bridgeInstance.rootChainID} and childchain ${bridgeInstance.childChainID} is not supported in environment ${baseConfig.environment}`,
      );
    }
    const bridgeContracts = ContractsForBridge.get(bridgeInstance);
    if (!bridgeContracts) {
      throw new Error(
        `Bridge instance with rootchain ${bridgeInstance.rootChainID} and childchain ${bridgeInstance.childChainID} is not supported in environment ${baseConfig.environment}`,
      );
    }
    this.bridgeContracts = bridgeContracts;
  }
}

// TODO: Add correct addresses
export const ContractsForBridge = new Map<BridgeInstance, BridgeContracts>()
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

const SupportedSandboxBridges: BridgeInstance[] = [ETH_SEPOLIA_TO_ZKEVM_DEVNET];

const SupportedProductionBridges: BridgeInstance[] = [];

export const SupportedBridgesForEnvironment: {
  [key in Environment]: BridgeInstance[];
} = {
  [Environment.SANDBOX]: SupportedSandboxBridges,
  [Environment.PRODUCTION]: SupportedProductionBridges,
};
