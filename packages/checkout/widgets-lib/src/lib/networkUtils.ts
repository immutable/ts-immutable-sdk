import { ChainId } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';

export enum ConnectTargetLayer {
  LAYER1 = 'LAYER1',
  LAYER2 = 'LAYER2',
}

export function l1Network(environment: Environment) {
  return environment === Environment.PRODUCTION
    ? ChainId.SEPOLIA
    : ChainId.SEPOLIA;
}

export function zkEVMNetwork(environment: Environment) {
  return environment === Environment.PRODUCTION
    ? ChainId.IMTBL_ZKEVM_TESTNET
    : ChainId.IMTBL_ZKEVM_DEVNET;
}

export function getTargetLayerChainId(targetLayer: ConnectTargetLayer, environment: Environment) {
  return targetLayer === ConnectTargetLayer.LAYER2
    ? zkEVMNetwork(environment)
    : l1Network(environment);
}
