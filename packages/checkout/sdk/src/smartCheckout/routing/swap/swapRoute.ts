import { BigNumber, utils } from 'ethers';
import { deprecated } from '@imtbl/dex-sdk';
import { CheckoutConfiguration, getL2ChainId } from '../../../config';
import {
  AvailableRoutingOptions,
  ChainId,
  FundingStepType,
  GetBalanceResult,
  IMX_ADDRESS_ZKEVM,
  ItemType,
  SwapFees,
  SwapFundingStep,
  TokenInfo,
} from '../../../types';
import { BalanceCheckResult, BalanceRequirement } from '../../balanceCheck/types';
import { TokenBalanceResult } from '../types';
import { quoteFetcher } from './quoteFetcher';

const constructFees = (
  approvalGasFees: deprecated.Amount | null | undefined,
  swapGasFees: deprecated.Amount | null,
  swapFees: deprecated.Fee[],
): SwapFees => {
  let approvalGasFeeAmount = BigNumber.from(0);
  let approvalGasFeeFormatted = '0';
  let approvalToken: TokenInfo | undefined;
  if (approvalGasFees) {
    approvalGasFeeAmount = approvalGasFees.value;
    approvalGasFeeFormatted = utils.formatUnits(approvalGasFees.value, approvalGasFees.token.decimals);
    approvalToken = {
      name: approvalGasFees.token.name ?? '',
      symbol: approvalGasFees.token.symbol ?? '',
      address: approvalGasFees.token.address,
      decimals: approvalGasFees.token.decimals,
    };
  }

  let swapGasFeeAmount = BigNumber.from(0);
  let swapGasFeeFormatted = '0';
  let swapGasToken: TokenInfo | undefined;
  if (swapGasFees) {
    swapGasFeeAmount = swapGasFees.value;
    swapGasFeeFormatted = utils.formatUnits(swapGasFees.value, swapGasFees.token.decimals);
    swapGasToken = {
      name: swapGasFees.token.name ?? '',
      symbol: swapGasFees.token.symbol ?? '',
      address: swapGasFees.token.address,
      decimals: swapGasFees.token.decimals,
    };
  }

  const fees = [];
  for (const swapFee of swapFees) {
    fees.push({
      amount: swapFee.amount.value,
      formattedAmount: utils.formatUnits(swapFee.amount.value, swapFee.amount.token.decimals),
      token: {
        name: swapFee.amount.token.name ?? '',
        symbol: swapFee.amount.token.symbol ?? '',
        address: swapFee.amount.token.address,
        decimals: swapFee.amount.token.decimals,
      },
    });
  }

  return {
    approvalGasFees: {
      amount: approvalGasFeeAmount,
      formattedAmount: approvalGasFeeFormatted,
      token: approvalToken,
    },
    swapGasFees: {
      amount: swapGasFeeAmount,
      formattedAmount: swapGasFeeFormatted,
      token: swapGasToken,
    },
    swapFees: fees,
  };
};

export const constructSwapRoute = (
  chainId: ChainId,
  fundsRequired: BigNumber,
  userBalance: GetBalanceResult,
  fees: SwapFees,
): SwapFundingStep => {
  const tokenAddress = userBalance.token.address;

  let type = ItemType.ERC20;
  if (tokenAddress === IMX_ADDRESS_ZKEVM) {
    type = ItemType.NATIVE;
  }

  return {
    type: FundingStepType.SWAP,
    chainId,
    fundingItem: {
      type,
      fundsRequired: {
        amount: fundsRequired,
        formattedAmount: utils.formatUnits(
          fundsRequired,
          userBalance.token.decimals,
        ),
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

export const getRequiredToken = (
  balanceRequirement: BalanceRequirement,
): { address: string, amount: BigNumber } => {
  let address = '';
  let amount = BigNumber.from(0);

  switch (balanceRequirement.type) {
    case ItemType.ERC20:
      address = balanceRequirement.required.token.address ?? '';
      amount = balanceRequirement.delta.balance;
      break;
    case ItemType.NATIVE:
      address = IMX_ADDRESS_ZKEVM;
      amount = balanceRequirement.delta.balance;
      break;
    default: break;
  }

  return { address, amount };
};

type SufficientApprovalFees = { sufficient: boolean, approvalGasFee: BigNumber, approvalGasTokenAddress: string };
export const checkUserCanCoverApprovalFees = (
  l2Balances: GetBalanceResult[],
  approval: deprecated.Amount | null,
): SufficientApprovalFees => {
  // Check if approval required
  if (!approval) return { sufficient: true, approvalGasFee: BigNumber.from(0), approvalGasTokenAddress: '' };

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
  const l2BalanceOfApprovalToken = l2Balances.find((balance) => balance.token.address === approvalGasTokenAddress);
  if (!l2BalanceOfApprovalToken) return { sufficient: false, approvalGasFee, approvalGasTokenAddress };

  // If the user does not have enough of the token to cover approval fees then return sufficient false
  if (l2BalanceOfApprovalToken.balance.lt(approvalGasFee)) {
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
  swapGasFees: deprecated.Amount | null,
  swapFees: deprecated.Fee[],
  tokenBeingSwapped: { amount: BigNumber, address: string },
): boolean => {
  // Set up a map of token addresses to amounts for each of the swap fees
  const feeMap = new Map<string, BigNumber>();

  // Add the approval fee to list of fees
  if (approvalFees.approvalGasTokenAddress !== '') {
    feeMap.set(approvalFees.approvalGasTokenAddress, approvalFees.approvalGasFee);
  }

  // Add the swap gas fee to list of fees
  if (swapGasFees) {
    const fee = feeMap.get(swapGasFees.token.address);
    if (fee) {
      feeMap.set(swapGasFees.token.address, fee.add(swapGasFees.value));
    } else {
      feeMap.set(swapGasFees.token.address, swapGasFees.value);
    }
  }

  // Add the token being swapped to list of fees to ensure the user can cover the fee + the token swap
  if (tokenBeingSwapped) {
    const fee = feeMap.get(tokenBeingSwapped.address);
    if (fee) { // Token being swapped is the same as gas token
      feeMap.set(tokenBeingSwapped.address, fee.add(tokenBeingSwapped.amount));
    } else {
      feeMap.set(tokenBeingSwapped.address, tokenBeingSwapped.amount);
    }
  }

  // Get all the fees and key them by their token id
  for (const swapFee of swapFees) {
    const fee = feeMap.get(swapFee.amount.token.address);
    if (fee) {
      feeMap.set(swapFee.amount.token.address, fee.add(swapFee.amount.value));
      continue;
    }
    feeMap.set(swapFee.amount.token.address, swapFee.amount.value);
  }

  // Go through the map and for each token address check if the user has enough balance to cover the fee
  for (const [tokenAddress, fee] of feeMap.entries()) {
    if (fee === BigNumber.from(0)) continue;
    const l2BalanceOfFeeToken = l2Balances.find((balance) => balance.token.address === tokenAddress);
    if (!l2BalanceOfFeeToken) {
      return false;
    }
    if (l2BalanceOfFeeToken.balance.lt(fee)) {
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
  l2balance: BigNumber,
  balanceRequirements: BalanceCheckResult,
  quoteTokenAddress: string,
  amountBeingSwapped: BigNumber,
  approvalFees: SufficientApprovalFees,
  swapFees: deprecated.Fee[],
): boolean => {
  let remainingBalance = BigNumber.from(0);
  let balanceRequirementToken = '';
  let requirementExists = false;

  balanceRequirements.balanceRequirements.forEach((requirement) => {
    if (requirement.type === ItemType.NATIVE || requirement.type === ItemType.ERC20) {
      if (requirement.required.token.address === quoteTokenAddress) {
        balanceRequirementToken = requirement.required.token.address;
        requirementExists = true;
        // Get the balance that would remain if the requirement was removed from the users balance
        remainingBalance = l2balance.sub(requirement.required.balance);
      }
    }
  });

  // No requirement exists matching this token so no need to check if user can cover requirement
  if (!requirementExists) return true;

  // Remove approval fees from the remainder if token matches as these need to be taken out to cover the swap
  if (approvalFees.approvalGasTokenAddress === balanceRequirementToken) {
    remainingBalance = remainingBalance.sub(approvalFees.approvalGasFee);
  }

  // Remove swap fees from the remainder if token matches as these need to be taken out to cover the swap
  for (const swapFee of swapFees) {
    if (swapFee.amount.token.address === balanceRequirementToken) {
      remainingBalance = remainingBalance.sub(swapFee.amount.value);
    }
  }

  // If the users current balance can cover the balance after fees + the amount
  // that is going to be swapped from another item requirement then return true
  return remainingBalance.gte(amountBeingSwapped);
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

  const requiredToken = getRequiredToken(balanceRequirement);
  if (requiredToken.address === '') return fundingSteps;

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
    const userBalanceOfQuotedToken = l2Balances.find((balance) => balance.token.address === quoteTokenAddress);
    // If no balance found on L2 for this quoted token then continue
    if (!userBalanceOfQuotedToken) continue;
    // Check the amount of quoted token required against the user balance
    const amountOfQuoteTokenRequired = quote.quote.amount;

    // If user does not have enough balance to perform the swap with this token then continue
    if (userBalanceOfQuotedToken.balance.lt(amountOfQuoteTokenRequired.value)) continue;

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
