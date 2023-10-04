import { BigNumber, utils } from 'ethers';
import { GetBalanceResult, ItemType } from '../../../types';
import { BridgeRequirement } from '../bridge/bridgeRoute';
import { DexQuote, DexQuotes } from '../types';
import { INDEXER_ETH_ROOT_CONTRACT_ADDRESS, L1ToL2TokenAddressMapping } from '../indexer/fetchL1Representation';
import { BalanceCheckResult } from '../../balanceCheck/types';

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

// The token that is being bridged may also be a balance requirement
// Since this token is going to be swapped after bridging then get the
// balance requirement amount so this can be considered when bridging
// enough of the token across
const getAmountFromBalanceRequirement = (
  balanceRequirements: BalanceCheckResult,
  tokenAddress: string,
): BigNumber => {
  let amount = BigNumber.from(0);

  balanceRequirements.balanceRequirements.forEach((requirement) => {
    if (requirement.type === ItemType.NATIVE || requirement.type === ItemType.ERC20) {
      if (requirement.required.token.address === tokenAddress) {
        amount = amount.add(requirement.required.balance);
      }
    }
  });

  return amount;
};

// to be sent to the bridge route
export const constructBridgeRequirements = (
  dexQuotes: DexQuotes,
  l1balances: GetBalanceResult[],
  l2balances: GetBalanceResult[],
  l1tol2addresses: L1ToL2TokenAddressMapping[],
  balanceRequirements: BalanceCheckResult,
): BridgeRequirement[] => {
  const bridgeRequirements: BridgeRequirement[] = [];

  for (const [tokenAddress, quote] of dexQuotes) {
    // Get the L2 balance for the token address
    const l2balance = l2balances.find((balance) => balance.token.address === tokenAddress);
    const l1tol2TokenMapping = l1tol2addresses.find(
      (token) => token.l2address === tokenAddress,
    );
    if (!l1tol2TokenMapping) continue;

    const { l1address, l2address } = l1tol2TokenMapping;
    if (!l1address) continue;

    // If the user does not have any L1 balance for this token then cannot bridge
    const l1balance = l1balances.find((balance) => {
      if (balance.token.address === undefined
        && l1address === INDEXER_ETH_ROOT_CONTRACT_ADDRESS) {
        return true;
      }
      return balance.token.address === l1address;
    });
    if (!l1balance) continue;

    // Get the total amount using slippage to ensure a small buffer is added to cover price fluctuations
    const quotedAmount = quote.quote.amountWithMaxSlippage.value;
    // Add fees to the quoted amount if the fees are in the same token as the token being swapped
    const fees = getFeesForTokenAddress(quote, tokenAddress);
    // If the token being bridged is a balance requirement then add this to the total
    // to ensure when its swapped the balance requirement can still be fulfilled
    const balanceRequirementAmount = getAmountFromBalanceRequirement(balanceRequirements, tokenAddress);
    // Add all the amounts together
    const totalAmount = quotedAmount.add(fees).add(balanceRequirementAmount);

    // Subtract any L2 balance from the total amount to only bridge the necessary amount
    const amountToBridge = l2balance ? totalAmount.sub(l2balance.balance) : totalAmount;

    if (amountToBridge.lte(0)) {
      // If the amount to bridge is 0 then the user already has sufficient L2 balance to swap without bridging
      // In this scenario the swap route will be recommended by the router and no bridging is required
      continue;
    }

    if (amountToBridge.gt(l1balance.balance)) {
      continue;
    }

    bridgeRequirements.push({
      amount: amountToBridge,
      formattedAmount: utils.formatUnits(amountToBridge, l1balance.token.decimals),
      // L2 address is used for the bridge requirement as the bridge route uses the indexer to find L1 address
      l2address,
    });
  }

  return bridgeRequirements;
};
