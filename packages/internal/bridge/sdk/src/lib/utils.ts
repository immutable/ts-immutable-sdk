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
import {
  BridgeDirection,
  BridgeFeeActions, BridgeInstance, FungibleToken,
} from 'types';

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
 * This is the same as `isDeposit`, but takes an extra parameter - the `destinationChainId` - to check that both
 * of the chain IDs are correct.
 */
export function isValidDeposit(direction: BridgeDirection, bridgeInstance: BridgeInstance) {
  return direction.sourceChainId === bridgeInstance.rootChainID
    && direction.destinationChainId === bridgeInstance.childChainID
    && direction.action === BridgeFeeActions.DEPOSIT;
}

/**
 * @returns true if and only if the source chain is the root chain,
 *          indicating that this should be a deposit or withdraw finalisation, without doing validation.
 * Useful for if we believe a transaction should be a deposit or withdraw finalisation,
 * so you can construct relevant data types to then do the checks
 */
export function shouldBeDepositOrFinaliseWithdraw(sourceChainId: string, bridgeInstance: BridgeInstance) {
  return sourceChainId === bridgeInstance.rootChainID;
}

/**
 * This is the same as `isWithdraw`, but takes an extra parameter - the `destinationChainId` - to check that both
 * of the chain IDs are correct.
 */
export function isValidWithdraw(direction: BridgeDirection, bridgeInstance: BridgeInstance) {
  return direction.sourceChainId === bridgeInstance.childChainID
    && direction.destinationChainId === bridgeInstance.rootChainID
    && direction.action === BridgeFeeActions.WITHDRAW;
}

export function isWithdrawNativeIMX(
  token: FungibleToken,
  direction: BridgeDirection,
  bridgeInstance: BridgeInstance,
): boolean {
  return isValidWithdraw(direction, bridgeInstance) && !isWrappedIMX(token, direction.sourceChainId);
}

export function isWithdrawWrappedIMX(
  token: FungibleToken,
  direction: BridgeDirection,
  bridgeInstance: BridgeInstance,
): boolean {
  return isValidWithdraw(direction, bridgeInstance) && isWrappedIMX(token, direction.sourceChainId);
}

export const exportedForTesting = {
  getAddresses,
};
