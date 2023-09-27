import { CheckoutConfiguration, getL1ChainId, getL2ChainId } from '../../../config';
import { createBlockchainDataInstance } from '../../../instance';
import { IMX_ADDRESS_ZKEVM } from '../../../types';
import { getImxL1Representation, getIndexerChainName } from '../bridge/constants';

export type CrossChainTokenMapping = {
  l1address: string,
  l2token: {
    l2address: string,
    decimals: number | null,
    name: string | null,
    symbol: string | null,
  },
};
export const fetchL1Representation = async (
  config: CheckoutConfiguration,
  l2address: string,
): Promise<CrossChainTokenMapping | undefined> => {
  if (l2address === '') return undefined;
  if (l2address === IMX_ADDRESS_ZKEVM) {
    return {
      l1address: getImxL1Representation(getL1ChainId(config)),
      l2token: {
        l2address: IMX_ADDRESS_ZKEVM,
        decimals: 18,
        name: 'Immutable X',
        symbol: 'IMX',
      },
    };
  }

  const chainName = getIndexerChainName(getL2ChainId(config));
  if (chainName === '') return undefined; // Chain name not a valid indexer chain name

  const blockchainData = createBlockchainDataInstance(config);
  const tokenData = await blockchainData.getToken({
    chainName,
    contractAddress: l2address,
  });

  const l1address = tokenData.result.root_contract_address;
  if (l1address === null) return undefined; // No L1 representation of this token

  return {
    l1address,
    l2token: {
      l2address,
      decimals: tokenData.result.decimals,
      name: tokenData.result.name,
      symbol: tokenData.result.symbol,
    },
  };
};
