import { BigNumber, ethers, utils } from 'ethers';
import {
  BridgeFundingStep,
  ChainId,
  FundingStepType,
  GetBalanceResult,
  ItemType,
  AvailableRoutingOptions,
  BridgeFees,
  TokenInfo,
  FeeType,
} from '../../../types';
import { CheckoutConfiguration, getL1ChainId, getL2ChainId } from '../../../config';
import {
  TokenBalanceResult,
} from '../types';
import { getEthBalance } from './getEthBalance';
import { getBridgeFeeEstimate } from './getBridgeFeeEstimate';
import { CheckoutError, CheckoutErrorType } from '../../../errors';
import { allowListCheckForBridge } from '../../allowList/allowListCheck';
import {
  fetchL1Representation,
  L1ToL2TokenAddressMapping,
} from '../indexer/fetchL1Representation';
import { DEFAULT_TOKEN_DECIMALS } from '../../../env';
import { isNativeToken } from '../../../tokens';

export const hasSufficientL1Eth = (
  tokenBalanceResult: TokenBalanceResult,
  totalFees: BigNumber,
): boolean => {
  const balance = getEthBalance(tokenBalanceResult);
  return balance.gte(totalFees);
};

const constructFees = (
  bridgeGasFee: BigNumber,
  bridgeFee: BigNumber,
  imtblFee: BigNumber,
  approvalGasFee: BigNumber,
  token?: TokenInfo,
): BridgeFees => {
  const bridgeFeeDecimals = token?.decimals ?? DEFAULT_TOKEN_DECIMALS;
  const bridgeFees = [];

  if (bridgeFee.gt(0)) {
    bridgeFees.push({
      type: FeeType.BRIDGE_FEE,
      amount: bridgeFee,
      formattedAmount: utils.formatUnits(bridgeFee, bridgeFeeDecimals),
      token,
    });
  }

  if (imtblFee.gt(0)) {
    bridgeFees.push({
      type: FeeType.IMMUTABLE_FEE,
      amount: imtblFee,
      formattedAmount: utils.formatUnits(imtblFee, bridgeFeeDecimals),
      token,
    });
  }

  return {
    approvalGasFee: {
      type: FeeType.GAS,
      amount: approvalGasFee,
      formattedAmount: utils.formatUnits(approvalGasFee, DEFAULT_TOKEN_DECIMALS),
      token,
    },
    bridgeGasFee: {
      type: FeeType.GAS,
      amount: bridgeGasFee,
      formattedAmount: utils.formatUnits(bridgeGasFee, DEFAULT_TOKEN_DECIMALS),
      token,
    },
    bridgeFees,
  };
};

const constructBridgeFundingRoute = (
  chainId: ChainId,
  balance: GetBalanceResult,
  bridgeRequirement: BridgeRequirement,
  itemType: ItemType.NATIVE | ItemType.ERC20,
  fees: BridgeFees,
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
  fees,
});

export type BridgeRequirement = {
  amount: BigNumber;
  formattedAmount: string;
  l2address: string;
};
export const bridgeRoute = async (
  config: CheckoutConfiguration,
  readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>,
  availableRoutingOptions: AvailableRoutingOptions,
  bridgeRequirement: BridgeRequirement,
  tokenBalanceResults: Map<ChainId, TokenBalanceResult>,
): Promise<BridgeFundingStep | undefined> => {
  if (!availableRoutingOptions.bridge) return undefined;
  const l1ChainId = getL1ChainId(config);
  const l2ChainId = getL2ChainId(config);
  const nativeToken = config.networkMap.get(l1ChainId)?.nativeCurrency;
  const tokenBalanceResult = tokenBalanceResults.get(l1ChainId);
  const l1provider = readOnlyProviders.get(l1ChainId);
  if (!l1provider) {
    throw new CheckoutError(
      'No L1 provider available',
      CheckoutErrorType.PROVIDER_ERROR,
      { chainId: l1ChainId.toString() },
    );
  }

  // If no balances on layer 1 then Bridge cannot be an option
  if (tokenBalanceResult === undefined || tokenBalanceResult.success === false) return undefined;

  // todo: revert this back to using the allowlist
  const allowedTokenList = await allowListCheckForBridge(config, tokenBalanceResults, availableRoutingOptions);
  if (allowedTokenList.length === 0) return undefined;

  const l1RepresentationResult = await fetchL1Representation(config, bridgeRequirement.l2address);
  if (!l1RepresentationResult) return undefined;

  // Ensure l1address is in the allowed token list
  const { l1address } = l1RepresentationResult as L1ToL2TokenAddressMapping;
  if (isNativeToken(l1address)) {
    if (!allowedTokenList.find((token) => !('address' in token))) return undefined;
  } else if (!allowedTokenList.find((token) => token.address === l1address)) {
    return undefined;
  }

  const feesFromBridge = await getBridgeFeeEstimate(
    config,
    readOnlyProviders,
    l1ChainId,
    l2ChainId,
  );

  const {
    sourceChainGas,
    approvalGas,
    bridgeFee,
    imtblFee,
    totalFees,
  } = feesFromBridge;

  // If the user has no ETH to cover the bridge fees then bridge cannot be an option
  if (!hasSufficientL1Eth(tokenBalanceResult, totalFees)) return undefined;

  // If the L1 representation of the requirement is ETH then find the ETH balance and check if the balance covers the delta
  if (isNativeToken(l1address)) {
    const nativeETHBalance = tokenBalanceResult.balances
      .find((balance) => isNativeToken(balance.token.address));

    if (nativeETHBalance && nativeETHBalance.balance.gte(
      bridgeRequirement.amount.add(totalFees),
    )) {
      const bridgeFees = constructFees(
        sourceChainGas,
        bridgeFee,
        imtblFee,
        approvalGas,
        nativeToken,
      );
      return constructBridgeFundingRoute(l1ChainId, nativeETHBalance, bridgeRequirement, ItemType.NATIVE, bridgeFees);
    }

    return undefined;
  }

  // Find the balance of the L1 representation of the token and check if the balance covers the delta
  const erc20balance = tokenBalanceResult.balances.find((balance) => balance.token.address === l1address);

  if (erc20balance && erc20balance.balance.gte(
    bridgeRequirement.amount,
  )) {
    const bridgeFees = constructFees(
      sourceChainGas,
      bridgeFee,
      imtblFee,
      approvalGas,
      nativeToken,
    );
    return constructBridgeFundingRoute(l1ChainId, erc20balance, bridgeRequirement, ItemType.ERC20, bridgeFees);
  }

  return undefined;
};
