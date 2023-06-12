import { ChainId } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';

export enum ConnectTargetLayer {
  LAYER1 = 'LAYER1',
  LAYER2 = 'LAYER2',
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
    ? ChainId.IMTBL_ZKEVM_TESTNET
    : ChainId.IMTBL_ZKEVM_DEVNET;
}

/**
 * Returns the target network ChainId based on ConnectTargetLayer and environment
 * @param {ConnectTargetLayer} targetLayer
 * @param {Environment} environment
 * @returns {ChainId}
 */
export function getTargetLayerChainId(targetLayer: ConnectTargetLayer, environment: Environment) {
  return targetLayer === ConnectTargetLayer.LAYER2
    ? zkEVMNetwork(environment)
    : l1Network(environment);
}
