import { ChainId } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';

export enum ConnectTargetNetwork {
  ETHEREUM = 'ETHEREUM',
  ZK_EVM = 'ZK_EVM',
}

/**
 * Returns the preferred L1 ChainId for the given environment.
 * @param {Environment} environment
 * @returns {ChainId}
 */
export function l1Network(environment: Environment) {
  return environment === Environment.PRODUCTION
    ? ChainId.SEPOLIA
    : ChainId.SEPOLIA;
}

/**
 * Returns the preferred zkEVM ChainId for the given environment.
 * @param {Environment} environment
 * @returns {ChainId}
 */
export function zkEVMNetwork(environment: Environment) {
  return environment === Environment.PRODUCTION
    ? ChainId.POLYGON_ZKEVM // IMTBL_ZKEVM_TESTNET
    : ChainId.POLYGON_ZKEVM_TESTNET; // IMTBL_ZKEVM_DEVNET
}

/**
 * Returns the target network ChainId based on ConnectTargetNetwork and environment
 * @param {ConnectTargetNetwork} targetNetwork
 * @param {Environment} environment
 * @returns {ChainId}
 */
export function getTargetNetworkChainId(targetNetwork: ConnectTargetNetwork, environment: Environment) {
  return targetNetwork === ConnectTargetNetwork.ZK_EVM
    ? zkEVMNetwork(environment)
    : l1Network(environment);
}
