import { CheckoutConfiguration, getL1ChainId, getL2ChainId } from '../../../config';
import { createBlockchainDataInstance } from '../../../instance';
import { NATIVE } from '../../../env';
import { ChainId, ImxAddressConfig } from '../../../types';
import { isNativeToken } from '../../../tokens';

// If the root address evaluates to this then its ETH
export const INDEXER_ETH_ROOT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000eee';

const getIndexerChainName = (chainId: ChainId): string => {
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
): Promise<L1ToL2TokenAddressMapping | undefined> => {
  if (isNativeToken(l2address)) {
    return {
      l1address: await getImxL1Representation(getL1ChainId(config), config),
      l2address: NATIVE,
    };
  }

  const chainName = getIndexerChainName(getL2ChainId(config));
  const blockchainData = createBlockchainDataInstance(config);
  const tokenData = await blockchainData.getToken({
    chainName,
    contractAddress: l2address,
  });

  // TODO: When bridge is ready we need to understand how L2 ETH will be mapped back to L1 ETH
  const l1address = tokenData.result.root_contract_address;
  if (l1address === INDEXER_ETH_ROOT_CONTRACT_ADDRESS) {
    return {
      l1address: 'native',
      l2address,
    };
  }

  if (l1address === null) return undefined; // No L1 representation of this token
  return {
    l1address,
    l2address,
  };
};
