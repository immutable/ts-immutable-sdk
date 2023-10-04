import { BigNumber, ethers } from 'ethers';
import {
  BridgeFundingStep,
  ChainId,
  FundingStepType,
  GetBalanceResult,
  IMX_ADDRESS_ZKEVM,
  ItemType,
  AvailableRoutingOptions,
  BridgeRouteFeeEstimate,
  FundingRouteFeeEstimate,
} from '../../../types';
import { CheckoutConfiguration, getL1ChainId } from '../../../config';
import {
  TokenBalanceResult,
} from '../types';
import { BalanceRequirement } from '../../balanceCheck/types';
import { getEthBalance } from './getEthBalance';
import { getBridgeFeeEstimate } from './getBridgeFeeEstimate';
import { estimateGasForBridgeApproval } from './estimateApprovalGas';
import { CheckoutError, CheckoutErrorType } from '../../../errors';
import { allowListCheckForBridge } from '../../allowList/allowListCheck';
import { INDEXER_ETH_ROOT_CONTRACT_ADDRESS, fetchL1Representation } from '../indexer/fetchL1Representation';

export const hasSufficientL1Eth = (
  tokenBalanceResult: TokenBalanceResult,
  totalFees: BigNumber,
): boolean => {
  const balance = getEthBalance(tokenBalanceResult);
  return balance.gte(totalFees);
};

export const getTokenAddressFromRequirement = (
  balanceRequirement: BalanceRequirement,
): string => {
  if (balanceRequirement.type === ItemType.NATIVE) {
    return IMX_ADDRESS_ZKEVM;
  }

  if (balanceRequirement.type === ItemType.ERC20) {
    return balanceRequirement.required.token.address ?? '';
  }

  return '';
};

export const getBridgeGasEstimate = async (
  config: CheckoutConfiguration,
  readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>,
  feeEstimates: Map<FundingStepType, FundingRouteFeeEstimate>,
): Promise<BridgeRouteFeeEstimate> => {
  let bridgeFeeEstimate = feeEstimates.get(FundingStepType.BRIDGE);
  if (bridgeFeeEstimate) {
    return bridgeFeeEstimate as BridgeRouteFeeEstimate;
  }
  bridgeFeeEstimate = await getBridgeFeeEstimate(config, readOnlyProviders);
  feeEstimates.set(FundingStepType.BRIDGE, bridgeFeeEstimate);
  return bridgeFeeEstimate;
};

const constructBridgeFundingRoute = (
  chainId: ChainId,
  balance: GetBalanceResult,
  bridgeRequirement: BridgeRequirement,
  itemType: ItemType.NATIVE | ItemType.ERC20,
): BridgeFundingStep => ({
  type: FundingStepType.BRIDGE,
  chainId,
  fundingItem: {
    type: itemType,
    fundsRequired: {
      amount: bridgeRequirement.amount,
      formattedAmount: bridgeRequirement.formattedAmount,
    },
    userBalance: {
      balance: balance.balance,
      formattedBalance: balance.formattedBalance,
    },
    token: {
      name: balance.token.name,
      symbol: balance.token.symbol,
      address: balance.token.address,
      decimals: balance.token.decimals,
    },
  },
  // WT-1734 - Add fees
  fees: {
    approvalGasFees: {
      amount: BigNumber.from(0),
      formattedAmount: '0',
    },
    bridgeGasFees: {
      amount: BigNumber.from(0),
      formattedAmount: '0',
    },
    bridgeFees: [{
      amount: BigNumber.from(0),
      formattedAmount: '0',
    }],
  },
});

export const isNativeEth = (address: string | undefined): boolean => {
  if (!address || address === '') return true;
  return false;
};

export type BridgeRequirement = {
  amount: BigNumber;
  formattedAmount: string;
  l2address: string;
};
export const bridgeRoute = async (
  config: CheckoutConfiguration,
  readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>,
  depositorAddress: string,
  availableRoutingOptions: AvailableRoutingOptions,
  bridgeRequirement: BridgeRequirement,
  tokenBalanceResults: Map<ChainId, TokenBalanceResult>,
  feeEstimates: Map<FundingStepType, FundingRouteFeeEstimate>,
): Promise<BridgeFundingStep | undefined> => {
  if (!availableRoutingOptions.bridge) return undefined;
  if (bridgeRequirement.l2address === undefined || bridgeRequirement.l2address === '') return undefined;
  const chainId = getL1ChainId(config);
  const tokenBalanceResult = tokenBalanceResults.get(chainId);
  const l1provider = readOnlyProviders.get(chainId);
  if (!l1provider) {
    throw new CheckoutError(
      'No L1 provider available',
      CheckoutErrorType.PROVIDER_ERROR,
      { chainId: chainId.toString() },
    );
  }

  // If no balances on layer 1 then Bridge cannot be an option
  if (tokenBalanceResult === undefined || tokenBalanceResult.success === false) return undefined;

  const allowedTokenList = await allowListCheckForBridge(config, tokenBalanceResults, availableRoutingOptions);
  if (allowedTokenList.length === 0) return undefined;

  const bridgeFeeEstimate = await getBridgeGasEstimate(config, readOnlyProviders, feeEstimates);

  // If the user has no ETH to cover the bridge fees or approval fees then bridge cannot be an option
  if (!hasSufficientL1Eth(tokenBalanceResult, bridgeFeeEstimate.totalFees)) return undefined;

  const l1RepresentationResult = await fetchL1Representation(config, bridgeRequirement.l2address);
  // No mapping on L1 for this token
  const { l1address } = l1RepresentationResult;
  if (l1address === '') return undefined;

  // Ensure l1address is in the allowed token list
  if (l1address === INDEXER_ETH_ROOT_CONTRACT_ADDRESS) {
    if (!allowedTokenList.find((token) => !('address' in token))) return undefined;
  } else if (!allowedTokenList.find((token) => token.address === l1address)) {
    return undefined;
  }

  const gasForApproval = await estimateGasForBridgeApproval(
    config,
    readOnlyProviders,
    l1provider,
    depositorAddress,
    l1address,
    bridgeRequirement.amount,
  );

  let totalFees = bridgeFeeEstimate.bridgeFee.estimatedAmount;

  // If the L1 representation of the requirement is ETH then find the ETH balance and check if the balance covers the delta
  if (l1address === INDEXER_ETH_ROOT_CONTRACT_ADDRESS) {
    const nativeETHBalance = tokenBalanceResult.balances
      .find((balance) => isNativeEth(balance.token.address));

    if (bridgeFeeEstimate.gasFee.estimatedAmount) {
      totalFees = totalFees.add(bridgeFeeEstimate.gasFee.estimatedAmount);
    }

    if (!hasSufficientL1Eth(
      tokenBalanceResult,
      totalFees,
    )) return undefined;

    if (nativeETHBalance && nativeETHBalance.balance.gte(
      bridgeRequirement.amount.add(totalFees),
    )) {
      return constructBridgeFundingRoute(chainId, nativeETHBalance, bridgeRequirement, ItemType.NATIVE);
    }

    return undefined;
  }

  totalFees.add(gasForApproval).add(bridgeFeeEstimate.gasFee.estimatedAmount);
  if (!hasSufficientL1Eth(
    tokenBalanceResult,
    totalFees,
  )) return undefined;

  // Find the balance of the L1 representation of the token and check if the balance covers the delta
  const erc20balance = tokenBalanceResult.balances.find((balance) => balance.token.address === l1address);
  if (erc20balance && erc20balance.balance.gte(
    bridgeRequirement.amount,
  )) {
    return constructBridgeFundingRoute(chainId, erc20balance, bridgeRequirement, ItemType.ERC20);
  }

  return undefined;
};
