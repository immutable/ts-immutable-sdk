import { GetBalanceResult, ItemType } from '../../../types';
import { BridgeRequirement } from '../bridge/bridgeRoute';
import { DexQuote, DexQuotes } from '../types';
import { INDEXER_ETH_ROOT_CONTRACT_ADDRESS, L1ToL2TokenAddressMapping } from '../indexer/fetchL1Representation';
import { BalanceCheckResult } from '../../balanceCheck/types';
import { formatSmartCheckoutAmount, isMatchingAddress } from '../../../utils/utils';
import { formatUnits } from 'ethers';

// The dex will return all the fees which is in a particular token (currently always IMX)
// If any of the fees are in the same token that is trying to be swapped (e.g. trying to swap IMX)
// then these fees need to be added to the amount to bridge, otherwise not enough of the token
// will be bridged over to cover the amount to swap and any fees associated with the swap
export const getFeesForTokenAddress = (
  dexQuote: DexQuote,
  tokenAddress: string,
): bigint => {
  let fees = BigInt(0);

  dexQuote.quote.fees.forEach((fee) => {
    if (isMatchingAddress(fee.amount.token.address, tokenAddress)) {
      fees = fees + fee.amount.value;
    }
  });

  if (dexQuote.approval) {
    if (isMatchingAddress(dexQuote.approval.token.address, tokenAddress)) {
      fees = fees + dexQuote.approval.value;
    }
  }

  return fees;
};

// The token that is being bridged may also be a balance requirement
// Since this token is going to be swapped after bridging then get
// the amount of the current balance requirement
export const getAmountFromBalanceRequirement = (
  balanceRequirements: BalanceCheckResult,
  quotedTokenAddress: string,
): bigint => {
  // Find if there is an existing balance requirement of the token attempting to be bridged->swapped
  for (const requirement of balanceRequirements.balanceRequirements) {
    if (requirement.type === ItemType.NATIVE || requirement.type === ItemType.ERC20) {
      if (isMatchingAddress(requirement.required.token.address, quotedTokenAddress)) {
        return requirement.required.balance;
      }
    }
  }

  return BigInt(0);
};

// Get the total amount to bridge factoring in any balance requirements
// of this token and the current balance on L2
export const getAmountToBridge = (
  quotedAmountWithFees: bigint,
  amountFromBalanceRequirement: bigint,
  l2balance: GetBalanceResult | undefined,
): bigint => {
  const balance = l2balance?.balance ?? BigInt(0);

  // Balance is fully covered and does not require bridging
  // then the one swap route will be suggested
  if (balance >= (quotedAmountWithFees + amountFromBalanceRequirement)) {
    return BigInt(0);
  }

  // If no balance on L2 then bridge full amount and balance requirement amount if any
  if (balance <= 0) {
    return quotedAmountWithFees + amountFromBalanceRequirement;
  }

  // Get the remainder from the balance after subtracting the balance requirement amount
  const remainder = balance - amountFromBalanceRequirement;

  // Remove the remainder from the amount needed as the user has some balance left over
  // after covering the balance requirement or the remainder is 0 indicating they have
  // just enough to cover the balance requirement
  if (remainder >= 0) {
    return quotedAmountWithFees - remainder;
  }

  // If the remainder is less than 0 then add the quoted amount with the balance requirement
  // and sub the users current balance to get the total amount needed to be bridged to cover
  // the quoted amount + balance requirement
  return quotedAmountWithFees + amountFromBalanceRequirement - balance;
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
    const l2balance = l2balances.find((balance) => isMatchingAddress(balance.token.address, tokenAddress));
    const l1tol2TokenMapping = l1tol2addresses.find(
      (token) => isMatchingAddress(token.l2address, tokenAddress),
    );
    if (!l1tol2TokenMapping) continue;

    const { l1address, l2address } = l1tol2TokenMapping;
    if (!l1address) continue;

    // If the user does not have any L1 balance for this token then cannot bridge
    const l1balance = l1balances.find((balance) => {
      if (balance.token.address === undefined
        && isMatchingAddress(l1address, INDEXER_ETH_ROOT_CONTRACT_ADDRESS)) {
        return true;
      }
      return isMatchingAddress(balance.token.address, l1address);
    });
    if (!l1balance) continue;

    // Get the total amount using slippage to ensure a small buffer is added to cover price fluctuations
    const quotedAmount = quote.quote.amountWithMaxSlippage.value;
    // Add fees to the quoted amount if the fees are in the same token as the token being swapped
    const fees = getFeesForTokenAddress(quote, tokenAddress);
    const quotedAmountWithFees = quotedAmount + fees;

    // Get the amount from the balance requirement if the token is also a balance requirement
    const amountFromBalanceRequirement = getAmountFromBalanceRequirement(
      balanceRequirements,
      tokenAddress,
    );

    // Get the amount to bridge factoring in any balance requirements for this swappable token
    // and the current balance on L2
    const amountToBridge = getAmountToBridge(quotedAmountWithFees, amountFromBalanceRequirement, l2balance);

    // No amount to bridge as user has sufficient balance for one swap
    if (amountToBridge <= 0) {
      continue;
    }

    // If the amount to bridge is greater than the L1 balance then cannot bridge
    if (amountToBridge >= l1balance.balance) {
      continue;
    }

    bridgeRequirements.push({
      amount: amountToBridge,
      formattedAmount: formatSmartCheckoutAmount(formatUnits(amountToBridge, l1balance.token.decimals)),
      // L2 address is used for the bridge requirement as the bridge route uses the indexer to find L1 address
      l2address,
    });
  }

  return bridgeRequirements;
};
