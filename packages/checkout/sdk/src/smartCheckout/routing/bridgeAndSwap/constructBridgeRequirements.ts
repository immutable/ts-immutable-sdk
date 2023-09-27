import { BigNumber, utils } from 'ethers';
import { GetBalanceResult } from '../../../types';
import { BridgeRequirement } from '../bridge/bridgeRoute';
import { DexQuote, DexQuotes } from '../types';
import { CrossChainTokenMapping } from '../indexer/fetchL1Representation';

// The dex will return all the fees which is in a particular token (currently always IMX)
// If any of the fees are in the same token that is trying to be swapped (e.g. trying to swap IMX)
// then these fees need to be added to the amount to bridge, otherwise not enough of the token
// will be bridged over to cover the amount to swap and any fees associated with the swap
export const getFeesForTokenAddress = (
  dexQuote: DexQuote,
  tokenAddress: string,
): BigNumber => {
  let fees = BigNumber.from(0);

  dexQuote.quote.fees.forEach((fee) => {
    if (fee.amount.token.address === tokenAddress) {
      fees = fees.add(fee.amount.value);
    }
  });

  if (dexQuote.approval) {
    if (dexQuote.approval.token.address === tokenAddress) {
      fees = fees.add(dexQuote.approval.value);
    }
  }

  return fees;
};

// to be sent to the bridge route
export const constructBridgeRequirements = (
  dexQuotes: DexQuotes,
  l1balances: GetBalanceResult[],
  l2balances: GetBalanceResult[],
  crossChainTokenMapping: CrossChainTokenMapping[],
): BridgeRequirement[] => {
  const bridgeRequirements: BridgeRequirement[] = [];

  for (const [tokenAddress, quote] of dexQuotes) {
    // Get the L2 balance for the token address
    const l2balance = l2balances.find((balance) => balance.token.address === tokenAddress);

    const crossChainData = crossChainTokenMapping.find(
      (data) => data.l2token.l2address === tokenAddress,
    );
    if (!crossChainData) continue;

    const { l1address, l2token } = crossChainData;
    if (!l1address) continue;

    // If the user does not have any L1 balance for this token then cannot bridge
    const l1balance = l1balances.find((balance) => balance.token.address === l1address);
    if (!l1balance) continue;

    // Get the total amount using slippage to ensure a small buffer is added to cover price fluctuations
    const quotedAmount = quote.quote.amountWithMaxSlippage.value; // todo: test slippage
    // Add fees to the quoted amount if the fees are in the same token as the token being swapped
    const fees = getFeesForTokenAddress(quote, tokenAddress);
    const totalAmount = quotedAmount.add(fees);

    // Subtract any L2 balance from the total amount to only bridge the necessary amount
    const amountToBridge = l2balance ? totalAmount.sub(l2balance.balance) : totalAmount;

    if (amountToBridge.lte(0)) {
      // If the amount to bridge is 0 then the user already has sufficient L2 balance to swap without bridging
      // In this scenario the swap route will be recommended by the router and no bridging is required
      continue;
    }

    bridgeRequirements.push({
      amountToBridge: {
        amount: amountToBridge,
        formattedAmount: utils.formatUnits(amountToBridge, l1balance.token.decimals),
      },
      // L2 address is used for the bridge requirement as the bridge route uses the indexer to find L1 address
      token: {
        address: tokenAddress,
        // Try to get decimals from indexer, otherwise just use the L1 balance decimals as best effort
        // Swap requires a TokenInfo, but the user may not have L2 balance so we need to use the inedxer
        // to get these values
        decimals: l2token.decimals ? l2token.decimals : l1balance.token.decimals,
        symbol: l2token.symbol ? l2token.symbol : '',
        name: l2token.name ? l2token.name : '',
      },
    });
  }

  return bridgeRequirements;
};
