import { ChainId, CheckoutConfiguration } from '@imtbl/checkout-sdk';

// **************************************************** //
// **************************************************** //
// This is duplicated in the sdk project.               //
// We are not exposing these functions given that this  //
// to keep the Checkout SDK interface as minimal as     //
// possible.                                            //
// **************************************************** //
export const getL1ChainId = (config: CheckoutConfiguration): ChainId => {
  // DevMode and Sandbox will both use Sepolia.
  if (!config.isProduction) return ChainId.SEPOLIA;
  return ChainId.ETHEREUM;
};

export const getL2ChainId = (config: CheckoutConfiguration): ChainId => {
  if (config.isDevelopment) return ChainId.IMTBL_ZKEVM_DEVNET;
  if (config.isProduction) return ChainId.IMTBL_ZKEVM_MAINNET;
  return ChainId.IMTBL_ZKEVM_TESTNET;
};
// **************************************************** //
// **************************************************** //

export enum ConnectTargetLayer {
  LAYER1 = 'LAYER1',
  LAYER2 = 'LAYER2',
}

export function getTargetLayerChainId(config: CheckoutConfiguration, targetLayer: ConnectTargetLayer) {
  if (targetLayer === ConnectTargetLayer.LAYER2) return getL2ChainId(config);
  return getL1ChainId(config);
}
