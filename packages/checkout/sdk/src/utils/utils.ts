import { ChainId } from '../types';

export const isMatchingAddress = (addressA: string = '', addressB: string = '') => (
  addressA.toLowerCase() === addressB.toLowerCase()
);

export const isZkEvmChainId = (chainId: ChainId) => chainId === ChainId.IMTBL_ZKEVM_DEVNET
  || chainId === ChainId.IMTBL_ZKEVM_TESTNET
  || chainId === ChainId.IMTBL_ZKEVM_MAINNET;
