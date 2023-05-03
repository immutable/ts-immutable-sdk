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

    const supported =
      SupportedBridgesForEnvironment[baseConfig.environment].includes(
        bridgeInstance
      );
    if (!supported) {
      throw new Error(
        `Bridge instance with rootchain ${bridgeInstance.rootChainID} and childchain ${bridgeInstance.childChainID} is not supported in environment ${baseConfig.environment}`
      );
    }
    if (!ContractsForBridge.has(bridgeInstance)) {
      throw new Error(
        `Bridge instance with rootchain ${bridgeInstance.rootChainID} and childchain ${bridgeInstance.childChainID} is not supported in environment ${baseConfig.environment}`
      );
    }
    const bridgeContracts = ContractsForBridge.get(bridgeInstance);
    if (!bridgeContracts) {
      throw new Error(
        `Bridge instance with rootchain ${bridgeInstance.rootChainID} and childchain ${bridgeInstance.childChainID} is not supported in environment ${baseConfig.environment}`
      );
    }
    this.bridgeContracts = bridgeContracts;
  }
}

export const ContractsForBridge = new Map<BridgeInstance, BridgeContracts>()
  .set(ETH_SEPOLIA_TO_ZKEVM_DEVNET, {
    rootChainERC20Predicate: '0x',
    rootChainStateSender: '0x',
    childChainERC20Predicate: '0x',
    childChainStateReceiver: '0x',
  })
  .set(ETH_MAINNET_TO_ZKEVM_MAINNET, {
    rootChainERC20Predicate: '0x',
    rootChainStateSender: '0x',
    childChainERC20Predicate: '0x',
    childChainStateReceiver: '0x',
  });

const SupportedSandboxBridges: BridgeInstance[] = [ETH_SEPOLIA_TO_ZKEVM_DEVNET];

const SupportedProductionBridges: BridgeInstance[] = [
  ETH_MAINNET_TO_ZKEVM_MAINNET,
];

export const SupportedBridgesForEnvironment: {
  [key in Environment]: BridgeInstance[];
} = {
  [Environment.SANDBOX]: SupportedSandboxBridges,
  [Environment.PRODUCTION]: SupportedProductionBridges,
};
