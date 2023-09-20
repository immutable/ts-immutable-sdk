import { ChainId } from '../../../types';

// If the root address evaluates to this then its ETH
export const INDEXER_ETH_ROOT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000001';

export const getIndexerChainName = (chainId: ChainId): string => {
  if (chainId === ChainId.IMTBL_ZKEVM_TESTNET) return 'imtbl-zkevm-testnet';
  return '';
};

// Indexer ERC20 call does not support IMX so cannot get root chain mapping from this endpoint.
// TODO: WT-1693 - Move mapping to remote config
export const getImxL1Representation = (chainId: ChainId): string => {
  if (chainId === ChainId.SEPOLIA) return '0x2Fa06C6672dDCc066Ab04631192738799231dE4a';
  if (chainId === ChainId.ETHEREUM) return '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF';
  return '';
};
