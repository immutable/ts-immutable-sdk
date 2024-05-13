import {
  ETH_MAINNET_TO_ZKEVM_MAINNET, childETHs, ETH_SEPOLIA_TO_ZKEVM_TESTNET, rootIMXs,
  childAdaptors,
  rootAdaptors,
  childChains,
  axelarGateways,
  axelarAPIEndpoints,
  tenderlyAPIEndpoints,
  childWIMXs,
} from 'constants/bridges';
import { BridgeInstance, FungibleToken } from 'types';

function getAddresses(source:string, addresses:Record<string, string>) {
  let address:string;
  if (source === ETH_MAINNET_TO_ZKEVM_MAINNET.rootChainID
    || source === ETH_MAINNET_TO_ZKEVM_MAINNET.childChainID) {
    address = addresses.mainnet;
  } else if (source === ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID
    || source === ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID) {
    address = addresses.testnet;
  } else {
    address = addresses.devnet;
  }
  return address;
}

function getChildETH(source: string) {
  return getAddresses(source, childETHs);
}

export function isChildETH(token: FungibleToken, source: string) {
  return token.toUpperCase() === getChildETH(source).toUpperCase();
}

export function getRootIMX(source: string) {
  return getAddresses(source, rootIMXs);
}

export function isRootIMX(token: FungibleToken, source: string) {
  return token.toUpperCase() === getRootIMX(source).toUpperCase();
}

export function getChildAdaptor(source: string) {
  return getAddresses(source, childAdaptors);
}

export function getRootAdaptor(source: string) {
  return getAddresses(source, rootAdaptors);
}

export function getChildchain(source: string) {
  return getAddresses(source, childChains);
}

export function getAxelarGateway(source: string) {
  return getAddresses(source, axelarGateways);
}

export function getAxelarEndpoint(source:string) {
  return getAddresses(source, axelarAPIEndpoints);
}

export function getTenderlyEndpoint(source:string) {
  return getAddresses(source, tenderlyAPIEndpoints);
}

function getWrappedIMX(source: string) {
  return getAddresses(source, childWIMXs);
}

export function isWrappedIMX(token: FungibleToken, source: string) {
  return token.toUpperCase() === getWrappedIMX(source).toUpperCase();
}

/**
 * Assumes the destination chain is correct (i.e. it doesn't check the destination chain)
 */
export function isDeposit(sourceChainId: string, bridgeInstance: BridgeInstance): boolean {
  return sourceChainId === bridgeInstance.rootChainID;
}

/**
 * Assumes the destination chain is correct (i.e. it doesn't check the destination chain)
 */
export function isWithdraw(sourceChainId: string, bridgeInstance: BridgeInstance): boolean {
  return sourceChainId === bridgeInstance.childChainID;
}

export function isWithdrawNotWrappedIMX(
  token: FungibleToken,
  sourceChainId: string,
  bridgeInstance: BridgeInstance,
): boolean {
  return isWithdraw(sourceChainId, bridgeInstance) && !isRootIMX(token, sourceChainId);
}

export function isWithdrawWrappedIMX(
  token: FungibleToken,
  sourceChainId: string,
  bridgeInstance: BridgeInstance,
): boolean {
  return isWithdraw(sourceChainId, bridgeInstance) && isRootIMX(token, sourceChainId);
}

/**
 * This is the same as `isDeposit`, but takes an extra parameter - the `destinationChainId` - to check that both
 * of the chain IDs are correct.
 */
export function isValidDeposit(sourceChainId: string, destinationChainId: string, bridgeInstance: BridgeInstance) {
  return sourceChainId === bridgeInstance.rootChainID && destinationChainId === bridgeInstance.childChainID;
}

/**
 * This is the same as `isWithdraw`, but takes an extra parameter - the `destinationChainId` - to check that both
 * of the chain IDs are correct.
 */
export function isValidWithdraw(sourceChainId: string, destinationChainId: string, bridgeInstance: BridgeInstance) {
  return sourceChainId === bridgeInstance.childChainID && destinationChainId === bridgeInstance.rootChainID;
}

export const exportedForTesting = {
  getAddresses,
};
