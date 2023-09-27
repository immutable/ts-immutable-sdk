import { CheckoutConfiguration, getL1ChainId, getL2ChainId } from '../../../config';
import { createBlockchainDataInstance } from '../../../instance';
import { IMX_ADDRESS_ZKEVM } from '../../../types';
import { getImxL1Representation, getIndexerChainName } from '../bridge/constants';

export type L1ToL2TokenAddressMapping = {
  l1address: string,
  l2address: string,
};
export const fetchL1Representation = async (
  config: CheckoutConfiguration,
  l2address: string,
): Promise<L1ToL2TokenAddressMapping> => {
  if (l2address === '') return { l1address: '', l2address };
  if (l2address === IMX_ADDRESS_ZKEVM) {
    return {
      l1address: getImxL1Representation(getL1ChainId(config)),
      l2address: IMX_ADDRESS_ZKEVM,
    };
  }

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
