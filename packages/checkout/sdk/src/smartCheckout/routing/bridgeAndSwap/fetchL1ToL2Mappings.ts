import { CheckoutConfiguration } from '../../../config';
import { TokenInfo } from '../../../types';
import { L1ToL2TokenAddressMapping, fetchL1Representation } from '../indexer/fetchL1Representation';

export const fetchL1ToL2Mappings = async (
  config: CheckoutConfiguration,
  swappableTokens: TokenInfo[],
): Promise<L1ToL2TokenAddressMapping[]> => {
  const l1tol2addressMappingPromises = swappableTokens.map(
    (token) => fetchL1Representation(config, token.address ?? ''),
  );
  return await Promise.all(l1tol2addressMappingPromises);
};
