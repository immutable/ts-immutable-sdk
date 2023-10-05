import { BigNumber } from 'ethers';
import { CheckoutConfiguration, getL2ChainId } from '../../../config';
import { DexQuoteCache, DexQuotes } from '../types';
import { quoteFetcher } from './quoteFetcher';

export const getOrSetQuotesFromCache = async (
  config: CheckoutConfiguration,
  dexQuoteCache: DexQuoteCache,
  walletAddress: string,
  requiredToken: {
    address: string,
    amount: BigNumber,
  },
  swappableTokens: string[],
): Promise<DexQuotes> => {
  const dexQuotes = dexQuoteCache.get(requiredToken.address);
  if (dexQuotes && dexQuotes.size > 0) return dexQuotes;

  const quotes = await quoteFetcher(
    config,
    getL2ChainId(config),
    walletAddress,
    requiredToken,
    swappableTokens,
  );

  dexQuoteCache.set(requiredToken.address, quotes);
  return quotes;
};
