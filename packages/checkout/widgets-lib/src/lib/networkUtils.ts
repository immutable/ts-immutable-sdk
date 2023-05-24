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
export function L1Network(environment: Environment) {
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
