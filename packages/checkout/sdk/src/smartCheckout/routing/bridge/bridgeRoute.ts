/* eslint-disable @typescript-eslint/no-unused-vars */
import { BigNumber, Contract, ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import {
  ChainId,
  GetBalanceResult,
  IMX_ADDRESS_ZKEVM,
  ItemType,
  RoutingOptionsAvailable,
} from '../../../types';
import { CheckoutConfiguration, getL1ChainId, getL2ChainId } from '../../../config';
import { FundingRouteStep, FundingRouteType, TokenBalanceResult } from '../types';
import { BalanceRequirement } from '../../balanceCheck/types';
import { createBlockchainDataInstance } from '../../../instance';
import { getEthBalance } from './getEthBalance';
import { bridgeGasEstimate } from './bridgeGasEstimate';
import { INDEXER_ETH_ROOT_CONTRACT_ADDRESS, getImxL1Representation, getIndexerChainName } from './constants';
import { estimateGasForBridgeApproval } from './estimateApprovalGas';
import { CheckoutError, CheckoutErrorType } from '../../../errors';

export const hasSufficientL1Eth = (
  balances: TokenBalanceResult,
  totalFees: BigNumber,
): boolean => {
  const balance = getEthBalance(balances);
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

export const fetchL1Representation = async (
  config: CheckoutConfiguration,
  balanceRequirement: BalanceRequirement,
): Promise<string> => {
  const l2address = getTokenAddressFromRequirement(balanceRequirement);
  if (l2address === '') return '';

  if (l2address === IMX_ADDRESS_ZKEVM) {
    return getImxL1Representation(getL1ChainId(config));
  }

  const chainName = getIndexerChainName(getL2ChainId(config));
  if (chainName === '') return ''; // Chain name not a valid indexer chain name

  const blockchainData = createBlockchainDataInstance(config);
  const tokenData = await blockchainData.getToken({
    chainName,
    contractAddress: l2address,
  });

  const l1address = tokenData.result.root_contract_address;
  if (l1address === null) return ''; // No L1 representation of this token

  return l1address;
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

export const bridgeRoute = async (
  config: CheckoutConfiguration,
  readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>,
  depositorAddress: string,
  availableRoutingOptions: RoutingOptionsAvailable,
  balanceRequirement: BalanceRequirement,
  balances: Map<ChainId, TokenBalanceResult>,
  feeEstimates: Map<FundingRouteType, BigNumber>,
): Promise<FundingRouteStep | undefined> => {
  if (!availableRoutingOptions.bridge) return undefined;

  const chainId = getL1ChainId(config);
  const tokenBalanceResult = balances.get(chainId);
  const l1provider = readOnlyProviders.get(chainId);
  if (!l1provider) {
    throw new CheckoutError(
      'No L1 provider available',
      CheckoutErrorType.PROVIDER_ERROR,
      { chainId: chainId.toString() },
    );
  }

  // If no balances on layer 1 then Bridge cannot be an option
  if (tokenBalanceResult === undefined || tokenBalanceResult.success === false) {
    throw new CheckoutError(
      'Error getting balances',
      CheckoutErrorType.GET_BALANCE_ERROR,
      { chainId: chainId.toString() },
    );
  }
  if (tokenBalanceResult.balances.length === 0) return undefined;

  const bridgeFeeEstimate = await getBridgeGasEstimate(config, readOnlyProviders, feeEstimates);

  // If the user has no ETH to cover the bridge fees or approval fees then bridge cannot be an option
  if (!hasSufficientL1Eth(tokenBalanceResult, bridgeFeeEstimate)) return undefined;

  const l1address = await fetchL1Representation(config, balanceRequirement);
  if (l1address === '') return undefined;

  const gasForApproval = await estimateGasForBridgeApproval(
    config,
    readOnlyProviders,
    l1provider,
    depositorAddress,
    l1address,
    balanceRequirement.delta.balance,
  );

  if (!hasSufficientL1Eth(
    tokenBalanceResult,
    gasForApproval.add(bridgeFeeEstimate),
  )) return undefined;

  // If the L1 representation of the requirement is ETH then find the ETH balance and check if the balance covers the delta
  if (l1address === INDEXER_ETH_ROOT_CONTRACT_ADDRESS) {
    const nativeETHBalance = tokenBalanceResult.balances
      .find((balance) => isNativeEth(balance.token.address));

    if (nativeETHBalance && nativeETHBalance.balance.gte(balanceRequirement.delta.balance.add(bridgeFeeEstimate))) {
      return constructBridgeFundingRoute(chainId, nativeETHBalance);
    }

    return undefined;
  }

  // Find the balance of the L1 representation of the token and check if the balance covers the delta
  const erc20balance = tokenBalanceResult.balances.find((balance) => balance.token.address === l1address);
  if (erc20balance && erc20balance.balance.gte(balanceRequirement.delta.balance)) {
    return constructBridgeFundingRoute(chainId, erc20balance);
  }

  return undefined;
};
