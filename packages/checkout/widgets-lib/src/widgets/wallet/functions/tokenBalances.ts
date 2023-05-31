import { Web3Provider } from '@ethersproject/providers';
import { Checkout, ChainId } from '@imtbl/checkout-sdk';
import { calculateCryptoToFiat, sortTokensByAmount } from '../../../lib/utils';

export interface BalanceInfo {
  id: string;
  symbol: string;
  description?: string;
  balance: string;
  fiatAmount: string;
  iconLogo?: string;
}

export const getTokenBalances = async (
  checkout: Checkout,
  provider: Web3Provider,
  networkName: string,
  chainId: ChainId,
  conversions: Map<string, number>,
): Promise<BalanceInfo[]> => {
  if (!checkout || !provider || !chainId) return [];

  try {
    const walletAddress = await provider.getSigner().getAddress();
    const getAllBalancesResult = await checkout.getAllBalances({
      provider,
      walletAddress,
      chainId,
    });

    const sortedTokens = sortTokensByAmount(
      checkout.config.environment,
      getAllBalancesResult.balances,
      chainId,
    );

    const tokenBalances: BalanceInfo[] = [];
    sortedTokens.forEach((balance) => {
      tokenBalances.push({
        id: `${networkName}-${balance.token.symbol}`,
        balance: balance.formattedBalance,
        fiatAmount: calculateCryptoToFiat(
          balance.formattedBalance,
          balance.token.symbol,
          conversions,
        ),
        symbol: balance.token.symbol,
        description: balance.token.name,
      });
    });

    return tokenBalances;
  } catch (err: any) {
    return []; // todo: what are the error scenarios?
  }
};
