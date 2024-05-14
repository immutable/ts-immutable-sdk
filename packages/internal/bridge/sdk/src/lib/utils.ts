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
import { FungibleToken } from 'types';

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

export const exportedForTesting = {
  getAddresses,
};
