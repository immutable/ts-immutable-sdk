import {
  ETH_MAINNET_TO_ZKEVM_MAINNET, childETHs, ETH_SEPOLIA_TO_ZKEVM_TESTNET, rootIMXs,
  childAdaptors,
  rootAdaptors,
  childChains,
  axelarGateways,
  axelarAPIEndpoints,
  tenderlyAPIEndpoints,
} from 'constants/bridges';
import { FungibleToken } from 'types';

export function getChildETH(source: string) {
  let eth:string;
  if (source === ETH_MAINNET_TO_ZKEVM_MAINNET.rootChainID
    || source === ETH_MAINNET_TO_ZKEVM_MAINNET.childChainID) {
    eth = childETHs.mainnet;
  } else if (source === ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID
    || source === ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID) {
    eth = childETHs.testnet;
  } else {
    eth = childETHs.devnet;
  }
  return eth;
}

export function isChildETH(token: FungibleToken, source: string) {
  return token.toUpperCase() === getChildETH(source).toUpperCase();
}

export function getRootIMX(source: string) {
  let rootIMX:string;
  if (source === ETH_MAINNET_TO_ZKEVM_MAINNET.rootChainID
    || source === ETH_MAINNET_TO_ZKEVM_MAINNET.childChainID) {
    rootIMX = rootIMXs.mainnet;
  } else if (source === ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID
    || source === ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID) {
    rootIMX = rootIMXs.testnet;
  } else {
    rootIMX = rootIMXs.devnet;
  }
  return rootIMX;
}

export function isRootIMX(token: FungibleToken, source: string) {
  return token.toUpperCase() === getRootIMX(source).toUpperCase();
}

export function getChildAdaptor(source: string) {
  let adaptor:string;
  if (source === ETH_MAINNET_TO_ZKEVM_MAINNET.rootChainID
    || source === ETH_MAINNET_TO_ZKEVM_MAINNET.childChainID) {
    adaptor = childAdaptors.mainnet;
  } else if (source === ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID
    || source === ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID) {
    adaptor = childAdaptors.testnet;
  } else {
    adaptor = childAdaptors.devnet;
  }
  return adaptor;
}

export function getRootAdaptor(source: string) {
  let adaptor:string;
  if (source === ETH_MAINNET_TO_ZKEVM_MAINNET.rootChainID
    || source === ETH_MAINNET_TO_ZKEVM_MAINNET.childChainID) {
    adaptor = rootAdaptors.mainnet;
  } else if (source === ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID
    || source === ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID) {
    adaptor = rootAdaptors.testnet;
  } else {
    adaptor = rootAdaptors.devnet;
  }
  return adaptor;
}

export function getChildchain(source: string) {
  let chain:string;
  if (source === ETH_MAINNET_TO_ZKEVM_MAINNET.rootChainID
    || source === ETH_MAINNET_TO_ZKEVM_MAINNET.childChainID) {
    chain = childChains.mainnet;
  } else if (source === ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID
    || source === ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID) {
    chain = childChains.testnet;
  } else {
    chain = childChains.devnet;
  }
  return chain;
}

export function getAxelarGateway(source: string) {
  let gateway:string;
  if (source === ETH_MAINNET_TO_ZKEVM_MAINNET.rootChainID
    || source === ETH_MAINNET_TO_ZKEVM_MAINNET.childChainID) {
    gateway = axelarGateways.mainnet;
  } else if (source === ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID
    || source === ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID) {
    gateway = axelarGateways.testnet;
  } else {
    gateway = axelarGateways.devnet;
  }
  return gateway;
}

export function getAxelarEndpoint(source:string) {
  let axelarAPIEndpoint:string;
  if (source === ETH_MAINNET_TO_ZKEVM_MAINNET.rootChainID
    || source === ETH_MAINNET_TO_ZKEVM_MAINNET.childChainID) {
    axelarAPIEndpoint = axelarAPIEndpoints.mainnet;
  } else if (source === ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID
    || source === ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID) {
    axelarAPIEndpoint = axelarAPIEndpoints.testnet;
  } else {
    axelarAPIEndpoint = axelarAPIEndpoints.devnet;
  }
  return axelarAPIEndpoint;
}

export function getTenderlyEndpoint(source:string) {
  let tenderlyAPIEndpoint:string;
  if (source === ETH_MAINNET_TO_ZKEVM_MAINNET.rootChainID
    || source === ETH_MAINNET_TO_ZKEVM_MAINNET.childChainID) {
    tenderlyAPIEndpoint = tenderlyAPIEndpoints.mainnet;
  } else if (source === ETH_SEPOLIA_TO_ZKEVM_TESTNET.rootChainID
    || source === ETH_SEPOLIA_TO_ZKEVM_TESTNET.childChainID) {
    tenderlyAPIEndpoint = tenderlyAPIEndpoints.testnet;
  } else {
    tenderlyAPIEndpoint = tenderlyAPIEndpoints.devnet;
  }
  return tenderlyAPIEndpoint;
}
