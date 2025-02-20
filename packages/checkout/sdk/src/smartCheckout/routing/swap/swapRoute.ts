import { Amount, Fee } from '@imtbl/dex-sdk';
import { formatUnits } from 'ethers';
import { CheckoutConfiguration, getL2ChainId } from '../../../config';
import {
  AvailableRoutingOptions,
  ChainId,
  Fee as SwapFee,
  FeeType,
  FundingStepType,
  GetBalanceResult,
  ItemType,
  SwapFees,
  SwapFundingStep,
  TokenInfo,
} from '../../../types';
import { BalanceCheckResult, BalanceRequirement } from '../../balanceCheck/types';
import { TokenBalanceResult } from '../types';
import { quoteFetcher } from './quoteFetcher';
import { isNativeToken } from '../../../tokens';
import { formatSmartCheckoutAmount, isMatchingAddress } from '../../../utils/utils';

const constructFees = (
  approvalGasFee: Amount | null | undefined,
  swapGasFee: Amount | null,
  swapFees: Fee[],
): SwapFees => {
  let approvalGasFeeAmount = BigInt(0);
  let approvalGasFeeFormatted = '0';
  let approvalToken: TokenInfo | undefined;
  if (approvalGasFee) {
    approvalGasFeeAmount = approvalGasFee.value;
    approvalGasFeeFormatted = formatUnits(approvalGasFee.value, approvalGasFee.token.decimals);
    approvalToken = {
      name: approvalGasFee.token.name ?? '',
      symbol: approvalGasFee.token.symbol ?? '',
      address: approvalGasFee.token.address,
      decimals: approvalGasFee.token.decimals,
    };
  }

  let swapGasFeeAmount = BigInt(0);
  let swapGasFeeFormatted = '0';
  let swapGasToken: TokenInfo | undefined;
  if (swapGasFee) {
    swapGasFeeAmount = swapGasFee.value;
    swapGasFeeFormatted = formatUnits(swapGasFee.value, swapGasFee.token.decimals);
    swapGasToken = {
      name: swapGasFee.token.name ?? '',
      symbol: swapGasFee.token.symbol ?? '',
      address: swapGasFee.token.address,
      decimals: swapGasFee.token.decimals,
    };
  }

  const fees: SwapFee[] = [];
  for (const swapFee of swapFees) {
    fees.push({
      type: FeeType.SWAP_FEE,
      amount: swapFee.amount.value,
      formattedAmount: formatUnits(swapFee.amount.value, swapFee.amount.token.decimals),
      basisPoints: swapFee.basisPoints,
      token: {
        name: swapFee.amount.token.name ?? '',
        symbol: swapFee.amount.token.symbol ?? '',
        address: swapFee.amount.token.address,
        decimals: swapFee.amount.token.decimals,
      },
    });
  }

  return {
    approvalGasFee: {
      type: FeeType.GAS,
      amount: approvalGasFeeAmount,
      formattedAmount: approvalGasFeeFormatted,
      token: approvalToken,
    },
    swapGasFee: {
      type: FeeType.GAS,
      amount: swapGasFeeAmount,
      formattedAmount: swapGasFeeFormatted,
      token: swapGasToken,
    },
    swapFees: fees,
  };
};

export const constructSwapRoute = (
  chainId: ChainId,
  fundsRequired: bigint,
  userBalance: GetBalanceResult,
  fees: SwapFees,
): SwapFundingStep => {
  const tokenAddress = userBalance.token.address;

  let type = ItemType.ERC20;
  if (isNativeToken(tokenAddress)) {
    type = ItemType.NATIVE;
  }

  return {
    type: FundingStepType.SWAP,
    chainId,
    fundingItem: {
      type,
      fundsRequired: {
        amount: fundsRequired,
        formattedAmount: formatSmartCheckoutAmount(formatUnits(
          fundsRequired,
          userBalance.token.decimals,
        )),
      },
      userBalance: {
        balance: userBalance.balance,
        formattedBalance: userBalance.formattedBalance,
      },
      token: userBalance.token,
    },
    fees,
  };
};

export const isBalanceRequirementTokenValid = (
  balanceRequirement: BalanceRequirement,
): boolean => {
  if (balanceRequirement.type === ItemType.ERC20) {
    return !!balanceRequirement.required.token.address;
  }

  if (balanceRequirement.type === ItemType.NATIVE) {
    return isNativeToken(balanceRequirement.required.token.address);
  }

  return false;
};

export const getRequiredToken = (
  balanceRequirement: BalanceRequirement,
): { address: string, amount: bigint } => {
  let address = '';
  let amount = BigInt(0);

  switch (balanceRequirement.type) {
    case ItemType.ERC20:
      address = balanceRequirement.required.token.address!;
      amount = balanceRequirement.delta.balance;
      break;
    case ItemType.NATIVE:
      amount = balanceRequirement.delta.balance;
      break;
    default: break;
  }

  return { address, amount };
};

type SufficientApprovalFees = { sufficient: boolean, approvalGasFee: bigint, approvalGasTokenAddress: string };
export const checkUserCanCoverApprovalFees = (
  l2Balances: GetBalanceResult[],
  approval: Amount | null,
): SufficientApprovalFees => {
  // Check if approval required
  if (!approval) return { sufficient: true, approvalGasFee: BigInt(0), approvalGasTokenAddress: '' };

  const approvalGasFee = approval.value;
  const approvalGasTokenAddress = approval.token.address;

  // No balance on L2 to cover approval fees
  if (l2Balances.length === 0) {
    return {
      sufficient: false,
      approvalGasFee,
      approvalGasTokenAddress,
    };
  }

  // Find the users balance of the approval token
  const l2BalanceOfApprovalToken = l2Balances.find(
    (balance) => (
      isNativeToken(balance.token.address) && isNativeToken(approvalGasTokenAddress))
    || isMatchingAddress(balance.token.address, approvalGasTokenAddress),
  );

  if (!l2BalanceOfApprovalToken) return { sufficient: false, approvalGasFee, approvalGasTokenAddress };

  // If the user does not have enough of the token to cover approval fees then return sufficient false
  if (l2BalanceOfApprovalToken.balance < approvalGasFee) {
    return {
      sufficient: false,
      approvalGasFee,
      approvalGasTokenAddress,
    };
  }

  // The user has enough to cover approval gas fees
  return { sufficient: true, approvalGasFee, approvalGasTokenAddress };
};

export const checkUserCanCoverSwapFees = (
  l2Balances: GetBalanceResult[],
  approvalFees: SufficientApprovalFees,
  swapGasFee: Amount | null,
  swapFees: Fee[],
  tokenBeingSwapped: { amount: bigint, address: string },
): boolean => {
  // Set up a map of token addresses to amounts for each of the swap fees
  const feeMap = new Map<string, bigint>();

  // Add the approval fee to list of fees
  if (approvalFees.approvalGasFee > BigInt(0)) {
    feeMap.set(approvalFees.approvalGasTokenAddress, approvalFees.approvalGasFee);
  }

  // Add the swap gas fee to list of fees
  if (swapGasFee) {
    const fee = feeMap.get(swapGasFee.token.address);
    if (fee) {
      feeMap.set(swapGasFee.token.address, fee + swapGasFee.value);
    } else {
      feeMap.set(swapGasFee.token.address, swapGasFee.value);
    }
  }

  // Add the token being swapped to list of fees to ensure the user can cover the fee + the token swap
  if (tokenBeingSwapped) {
    const fee = feeMap.get(tokenBeingSwapped.address);
    if (fee) { // Token being swapped is the same as gas token
      feeMap.set(tokenBeingSwapped.address, fee + tokenBeingSwapped.amount);
    } else {
      feeMap.set(tokenBeingSwapped.address, tokenBeingSwapped.amount);
    }
  }

  // Get all the fees and key them by their token id
  for (const swapFee of swapFees) {
    const fee = feeMap.get(swapFee.amount.token.address);
    if (fee) {
      feeMap.set(swapFee.amount.token.address, fee + swapFee.amount.value);
      continue;
    }
    feeMap.set(swapFee.amount.token.address, swapFee.amount.value);
  }

  // Go through the map and for each token address check if the user has enough balance to cover the fee
  for (const [tokenAddress, fee] of feeMap.entries()) {
    if (fee === BigInt(0)) continue;
    const l2BalanceOfFeeToken = l2Balances.find(
      (balance) => (
        isNativeToken(balance.token.address) && isNativeToken(tokenAddress))
        || isMatchingAddress(balance.token.address, tokenAddress),
    );
    if (!l2BalanceOfFeeToken) {
      return false;
    }
    if (l2BalanceOfFeeToken.balance < fee) {
      return false;
    }
  }

  return true;
};

// The item for swapping may also be a balance requirement
// for the action. Need to ensure that if the user does a swap
// this token to cover the insufficient balance that the user
// still has enough funds of this token to fulfill the balance
// requirement.
export const checkIfUserCanCoverRequirement = (
  l2balance: bigint,
  balanceRequirements: BalanceCheckResult,
  quoteTokenAddress: string,
  amountBeingSwapped: bigint,
  approvalFees: SufficientApprovalFees,
  swapFees: Fee[],
): boolean => {
  let remainingBalance = BigInt(0);
  let balanceRequirementToken = '';
  let requirementExists = false;

  balanceRequirements.balanceRequirements.forEach((requirement) => {
    if (requirement.type === ItemType.NATIVE || requirement.type === ItemType.ERC20) {
      if (
        requirement.required.token.address
        && isMatchingAddress(requirement.required.token.address, quoteTokenAddress)
      ) {
        balanceRequirementToken = requirement.required.token.address;
        requirementExists = true;
        // Get the balance that would remain if the requirement was removed from the users balance
        remainingBalance = l2balance - requirement.required.balance;
      }
    }
  });

  // No requirement exists matching this token so no need to check if user can cover requirement
  if (!requirementExists) return true;

  // Remove approval fees from the remainder if token matches as these need to be taken out to cover the swap
  if (isMatchingAddress(approvalFees.approvalGasTokenAddress, balanceRequirementToken)) {
    remainingBalance -= approvalFees.approvalGasFee;
  }

  // Remove swap fees from the remainder if token matches as these need to be taken out to cover the swap
  for (const swapFee of swapFees) {
    if (isMatchingAddress(swapFee.amount.token.address, balanceRequirementToken)) {
      remainingBalance -= swapFee.amount.value;
    }
  }

  // If the users current balance can cover the balance after fees + the amount
  // that is going to be swapped from another item requirement then return true
  return remainingBalance >= amountBeingSwapped;
};

export const swapRoute = async (
  config: CheckoutConfiguration,
  availableRoutingOptions: AvailableRoutingOptions,
  walletAddress: string,
  balanceRequirement: BalanceRequirement,
  tokenBalanceResults: Map<ChainId, TokenBalanceResult>,
  swappableTokens: string[],
  balanceRequirements: BalanceCheckResult,
): Promise<SwapFundingStep[]> => {
  const fundingSteps: SwapFundingStep[] = [];
  if (!availableRoutingOptions.swap) return fundingSteps;
  if (swappableTokens.length === 0) return fundingSteps;
  if (!isBalanceRequirementTokenValid(balanceRequirement)) return fundingSteps;

  const requiredToken = getRequiredToken(balanceRequirement);

  const chainId = getL2ChainId(config);
  const l2TokenBalanceResult = tokenBalanceResults.get(chainId);
  if (!l2TokenBalanceResult) return fundingSteps;
  const l2Balances = l2TokenBalanceResult.balances;
  if (l2Balances.length === 0) return fundingSteps;

  const quotes = await quoteFetcher(
    config,
    getL2ChainId(config),
    walletAddress,
    requiredToken,
    swappableTokens,
  );

  const quoteTokenAddresses = Array.from(quotes.keys());
  for (const quoteTokenAddress of quoteTokenAddresses) {
    const quote = quotes.get(quoteTokenAddress);
    if (!quote) continue;
    // Find the balance the user has for this quoted token
    const userBalanceOfQuotedToken = l2Balances.find(
      (balance) => isMatchingAddress(balance.token.address, quoteTokenAddress),
    );
    // If no balance found on L2 for this quoted token then continue
    if (!userBalanceOfQuotedToken) continue;
    // Check the amount of quoted token required against the user balance
    const amountOfQuoteTokenRequired = quote.quote.amountWithMaxSlippage;

    // If user does not have enough balance to perform the swap with this token then continue
    if (userBalanceOfQuotedToken.balance < amountOfQuoteTokenRequired.value) continue;

    const approvalFees = checkUserCanCoverApprovalFees(l2Balances, quote.approval);
    // If user does not have enough to cover approval fees then continue
    if (!approvalFees.sufficient) continue;

    // If user does not have enough to cover swap fees then continue
    if (!checkUserCanCoverSwapFees(
      l2Balances,
      approvalFees,
      quote.swap,
      quote.quote.fees,
      {
        amount: amountOfQuoteTokenRequired.value,
        address: quoteTokenAddress,
      },
    )) continue;

    if (!checkIfUserCanCoverRequirement(
      userBalanceOfQuotedToken.balance,
      balanceRequirements,
      quoteTokenAddress,
      amountOfQuoteTokenRequired.value,
      approvalFees,
      quote.quote.fees,
    )) continue;

    const fees = constructFees(quote.approval, quote.swap, quote.quote.fees);

    // User has sufficient funds of this token to cover any gas fees, swap fees and balance requirements
    // so add this token to the possible swap options
    fundingSteps.push(
      constructSwapRoute(
        chainId,
        amountOfQuoteTokenRequired.value,
        userBalanceOfQuotedToken,
        fees,
      ),
    );
  }

  return fundingSteps;
};
