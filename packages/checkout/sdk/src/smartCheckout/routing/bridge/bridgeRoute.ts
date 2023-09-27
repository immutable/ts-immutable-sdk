/* eslint-disable @typescript-eslint/no-unused-vars */
import { BigNumber, ethers } from 'ethers';
import {
  BalanceDelta,
  ChainId,
  FundingRouteType,
  GetBalanceResult,
  IMX_ADDRESS_ZKEVM,
  ItemType,
  RoutingOptionsAvailable,
  TokenInfo,
} from '../../../types';
import { CheckoutConfiguration, getL1ChainId } from '../../../config';
import { FundingRouteStep, TokenBalanceResult } from '../types';
import { BalanceRequirement } from '../../balanceCheck/types';
import { getEthBalance } from './getEthBalance';
import { bridgeGasEstimate } from './bridgeGasEstimate';
import { INDEXER_ETH_ROOT_CONTRACT_ADDRESS } from './constants';
import { estimateGasForBridgeApproval } from './estimateApprovalGas';
import { CheckoutError, CheckoutErrorType } from '../../../errors';
import { allowListCheckForBridge } from '../../allowList/allowListCheck';
import { fetchCrossChainTokenMapping } from '../indexer/fetchL1Representation';

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
  feeEstimates: Map<FundingRouteType, BigNumber>,
): Promise<BigNumber> => {
  let bridgeFeeEstimate = feeEstimates.get(FundingRouteType.BRIDGE);
  if (bridgeFeeEstimate) return bridgeFeeEstimate;

  bridgeFeeEstimate = await bridgeGasEstimate(config, readOnlyProviders);
  feeEstimates.set(FundingRouteType.BRIDGE, bridgeFeeEstimate);

  return bridgeFeeEstimate;
};

const constructBridgeFundingRoute = (
  chainId: ChainId,
  balance: GetBalanceResult,
) => ({
  type: FundingRouteType.BRIDGE,
  chainId,
  asset: {
    balance: balance.balance,
    formattedBalance: balance.formattedBalance,
    token: {
      name: balance.token.name,
      symbol: balance.token.symbol,
      address: balance.token.address,
      decimals: balance.token.decimals,
    },
  },
});

export const isNativeEth = (address: string | undefined): boolean => {
  if (!address || address === '') return true;
  return false;
};

export type BridgeRequirement = {
  amountToBridge: {
    amount: BigNumber;
    formattedAmount: string;
  },
  token: TokenInfo,
};
export const bridgeRoute = async (
  config: CheckoutConfiguration,
  readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>,
  depositorAddress: string,
  availableRoutingOptions: RoutingOptionsAvailable,
  bridgeRequirement: BridgeRequirement,
  tokenBalanceResults: Map<ChainId, TokenBalanceResult>,
  feeEstimates: Map<FundingRouteType, BigNumber>,
): Promise<FundingRouteStep | undefined> => {
  if (!availableRoutingOptions.bridge) return undefined;
  if (bridgeRequirement.token.address === undefined || bridgeRequirement.token.address === '') return undefined;
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
  if (!hasSufficientL1Eth(tokenBalanceResult, bridgeFeeEstimate)) return undefined;

  // const requiredTokenAddress = getTokenAddressFromRequirement(balanceRequirement);
  // todo: we can probably move out the indexer call and instead just pass through cache
  const tokenMapping = await fetchCrossChainTokenMapping(config, bridgeRequirement.token.address);
  // No mapping on L1 for this token
  if (tokenMapping === undefined) return undefined;
  const { l1address } = tokenMapping;
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
    bridgeRequirement.amountToBridge.amount, // todo: balanceRequirement.delta.balance
  );

  if (!hasSufficientL1Eth(
    tokenBalanceResult,
    gasForApproval.add(bridgeFeeEstimate),
  )) return undefined;

  // If the L1 representation of the requirement is ETH then find the ETH balance and check if the balance covers the delta
  if (l1address === INDEXER_ETH_ROOT_CONTRACT_ADDRESS) {
    const nativeETHBalance = tokenBalanceResult.balances
      .find((balance) => isNativeEth(balance.token.address));

    // todo: balanceRequirement.delta.balance
    if (nativeETHBalance && nativeETHBalance.balance.gte(
      // balanceRequirement.delta.balance.add(bridgeFeeEstimate)
      bridgeRequirement.amountToBridge.amount.add(bridgeFeeEstimate),
    )) {
      return constructBridgeFundingRoute(chainId, nativeETHBalance);
    }

    return undefined;
  }

  // Find the balance of the L1 representation of the token and check if the balance covers the delta
  const erc20balance = tokenBalanceResult.balances.find((balance) => balance.token.address === l1address);
  if (erc20balance && erc20balance.balance.gte(
    // balanceRequirement.delta.balance,
    bridgeRequirement.amountToBridge.amount,
  )) {
    return constructBridgeFundingRoute(chainId, erc20balance);
  }

  return undefined;
};
