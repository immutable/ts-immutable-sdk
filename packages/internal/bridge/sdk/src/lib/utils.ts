import {
  ETH_MAINNET_TO_ZKEVM_MAINNET, childETHs, ETH_SEPOLIA_TO_ZKEVM_TESTNET, rootIMXs,
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
