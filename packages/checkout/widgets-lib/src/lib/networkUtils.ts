import { ChainId } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';

/**
 * Returns the preferred L1 ChainId for the given environment.
 * @param {Environment} environment
 * @returns {ChainId}
 */
export function L1Network(environment: Environment) {
  return environment === Environment.PRODUCTION
    ? ChainId.ETHEREUM
    : ChainId.GOERLI;
}

/**
 * Returns the preferred zkEVM ChainId for the given environment.
 * @param {Environment} environment
 * @returns {ChainId}
 */
export function zkEVMNetwork(environment: Environment) {
  return environment === Environment.PRODUCTION
    ? ChainId.IMTBL_ZKEVM_TESTNET
    : ChainId.IMTBL_ZKEVM_DEVNET;
}
