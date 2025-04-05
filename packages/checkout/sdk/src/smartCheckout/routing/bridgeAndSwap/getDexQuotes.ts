import { CheckoutConfiguration } from '../../../config';
import { DexQuotes } from '../types';
import { BalanceNativeRequirement, BalanceERC20Requirement } from '../../balanceCheck/types';
import { TokenInfo } from '../../../types';
import { quoteFetcher } from '../swap/quoteFetcher';

// Fetch all the dex quotes from the list of swappable tokens
export const getDexQuotes = async (
  config: CheckoutConfiguration,
  ownerAddress: string,
  requiredTokenAddress: string,
  insufficientRequirement: BalanceNativeRequirement | BalanceERC20Requirement,
  filteredSwappableTokens: TokenInfo[],
): Promise<DexQuotes> => {
  const filteredSwappableTokensAddresses: string[] = [];
  for (const token of filteredSwappableTokens) {
    if (!token.address) continue;
    filteredSwappableTokensAddresses.push(token.address);
  }

  const dexQuotes = await quoteFetcher(
    config,
    config.l2ChainId,
    ownerAddress,
    {
      address: requiredTokenAddress as string,
      amount: insufficientRequirement.delta.balance,
    },
    filteredSwappableTokensAddresses,
  );

  return dexQuotes;
};
