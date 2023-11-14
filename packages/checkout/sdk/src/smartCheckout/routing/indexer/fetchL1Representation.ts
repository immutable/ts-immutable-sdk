import { CheckoutConfiguration, getL2ChainId } from '../../../config';
import { createBlockchainDataInstance } from '../../../instance';
import { ChainId, ImxAddressConfig } from '../../../types';

// If the root address evaluates to this then its ETH
export const INDEXER_ETH_ROOT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000001';

export const getIndexerChainName = (chainId: ChainId): string => {
  if (chainId === ChainId.IMTBL_ZKEVM_MAINNET) return 'imtbl-zkevm-mainnet';
  if (chainId === ChainId.IMTBL_ZKEVM_TESTNET) return 'imtbl-zkevm-testnet';
  if (chainId === ChainId.IMTBL_ZKEVM_DEVNET) return 'imtbl-zkevm-devent';
  return '';
};

// Indexer ERC20 call does not support IMX so cannot get root chain mapping from this endpoint.
// Use the remote config instead to find IMX address mapping.
export const getImxL1Representation = async (chainId: ChainId, config: CheckoutConfiguration): Promise<string> => {
  const imxMappingConfig = (await config.remote.getConfig(
    'imxAddressMapping',
  )) as ImxAddressConfig;

  return imxMappingConfig[chainId] ?? '';
};

export type L1ToL2TokenAddressMapping = {
  l1address: string,
  l2address: string,
};
export const fetchL1Representation = async (
  config: CheckoutConfiguration,
  l2address: string,
): Promise<L1ToL2TokenAddressMapping> => {
  // todo: Why is IMX-ZK address and empty strings are considered as two separate things??
  // todo: What is native token check for this code?
  if (l2address === '') return { l1address: '', l2address };
  // todo: do we need to fetch L1 representation for L2 native???
  // if (l2address === IMX_ADDRESS_ZKEVM) {
  //   return {
  //     l1address: await getImxL1Representation(getL1ChainId(config), config),
  //     l2address: IMX_ADDRESS_ZKEVM,
  //   };
  // }

  const chainName = getIndexerChainName(getL2ChainId(config));
  if (chainName === '') return { l1address: '', l2address }; // Chain name not a valid indexer chain name

  const blockchainData = createBlockchainDataInstance(config);
  const tokenData = await blockchainData.getToken({
    chainName,
    contractAddress: l2address,
  });

  const l1address = tokenData.result.root_contract_address;
  if (l1address === null) return { l1address: '', l2address }; // No L1 representation of this token

  return {
    l1address,
    l2address,
  };
};
