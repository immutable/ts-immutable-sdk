import { CheckoutConfiguration } from '../../../config';
import { CrossChainTokenMapping, fetchCrossChainTokenMapping } from '../indexer/fetchL1Representation';

export const fetchCrossChainMapping = async (
  config: CheckoutConfiguration,
  swappableL2Addresses: string[],
): Promise<CrossChainTokenMapping[]> => {
  const l2tol1addressMappingPromises = swappableL2Addresses.map((token) => fetchCrossChainTokenMapping(config, token));
  const l2tol1addresses = await Promise.all(l2tol1addressMappingPromises);
  return l2tol1addresses.filter((mapping) => mapping !== undefined) as CrossChainTokenMapping[];
};
