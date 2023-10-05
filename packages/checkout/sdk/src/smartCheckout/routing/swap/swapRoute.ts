import { BigNumber, utils } from 'ethers';
import { Amount, Fee } from '@imtbl/dex-sdk';
import { CheckoutConfiguration, getL2ChainId } from '../../../config';
import {
  AvailableRoutingOptions,
  ChainId,
  FundingStepType,
  GetBalanceResult,
  IMX_ADDRESS_ZKEVM,
  ItemType,
  SwapFundingStep,
} from '../../../types';
import { BalanceRequirement } from '../../balanceCheck/types';
import { DexQuoteCache, TokenBalanceResult } from '../types';
import { getOrSetQuotesFromCache } from './dexQuoteCache';

export const constructSwapRoute = (
  chainId: ChainId,
  fundsRequired: BigNumber,
  userBalance: GetBalanceResult,
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
    // WT-1734 - Add fees
    fees: {
      approvalGasFees: {
        amount: BigNumber.from(0),
        formattedAmount: '0',
      },
      swapGasFees: {
        amount: BigNumber.from(0),
        formattedAmount: '0',
      },
      swapFees: [{
        amount: BigNumber.from(0),
        formattedAmount: '0',
      }],
    },
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
  approval: Amount | null | undefined,
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
  swapFees: Fee[],
  approvalFees: SufficientApprovalFees,
  tokenBeingSwapped: { amount: BigNumber, address: string },
): boolean => {
  // Set up a map of token addresses to amounts for each of the swap fees
  const feeMap = new Map<string, BigNumber>();

  // Add the approval fee to list of fees
  if (approvalFees.approvalGasTokenAddress !== '') {
    feeMap.set(approvalFees.approvalGasTokenAddress, approvalFees.approvalGasFee);
  }

  // Add the token being swapped to list of fees to ensure the user can cover the fee + the token swap
  if (tokenBeingSwapped) {
    const fee = feeMap.get(tokenBeingSwapped.address);
    if (fee) { // Token being swapped is the same as approval token
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

export const swapRoute = async (
  config: CheckoutConfiguration,
  availableRoutingOptions: AvailableRoutingOptions,
  dexQuoteCache: DexQuoteCache,
  walletAddress: string,
  balanceRequirement: BalanceRequirement,
  tokenBalanceResults: Map<ChainId, TokenBalanceResult>,
  swappableTokens: string[],
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

  const quotes = await getOrSetQuotesFromCache(
    config,
    dexQuoteCache,
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
      quote.quote.fees,
      approvalFees,
      {
        amount: amountOfQuoteTokenRequired.value,
        address: quoteTokenAddress,
      },
    )) continue;

    // User has sufficient funds to cover any approval and swap fees so use this token for the funding route
    // Currently we are not prioritising any particular token so just taking the first sufficient token
    fundingSteps.push(
      constructSwapRoute(
        chainId,
        amountOfQuoteTokenRequired.value,
        userBalanceOfQuotedToken,
      ),
    );
  }

  return fundingSteps;
};
