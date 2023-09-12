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
import { estimateGasForBridgeApproval } from './estimateApprovalGas';

// If the root address evaluates to this then its ETH
export const INDEXER_ETH_ROOT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000001';

const getIndexerChainName = (chainId: ChainId): string => {
  if (chainId === ChainId.IMTBL_ZKEVM_TESTNET) return 'imtbl-zkevm-testnet';
  return '';
};

// Indexer ERC20 call does not support IMX so cannot get root chain mapping from this endpoint.
// TODO: WT-1693 - Move mapping to remote config
const getImxL1Representation = (chainId: ChainId): string => {
  if (chainId === ChainId.SEPOLIA) return '0x2Fa06C6672dDCc066Ab04631192738799231dE4a';
  if (chainId === ChainId.ETHEREUM) return '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF';
  return '';
};

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
  // Get the address from requirement
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

export const bridgeRoute = async (
  config: CheckoutConfiguration,
  provider: Web3Provider,
  readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>,
  availableRoutingOptions: RoutingOptionsAvailable,
  balanceRequirement: BalanceRequirement,
  balances: Map<ChainId, TokenBalanceResult>,
  feeEstimates: Map<FundingRouteType, BigNumber>,
): Promise<FundingRouteStep | undefined> => {
  if (!availableRoutingOptions.bridge) return undefined;

  const chainId = getL1ChainId(config);
  const tokenBalanceResult = balances.get(chainId);

  // If no balances on layer 1 then Bridge cannot be an option
  if (!tokenBalanceResult || !tokenBalanceResult.success) return undefined;
  if (tokenBalanceResult.balances.length === 0) return undefined;

  const bridgeFeeEstimate = await getBridgeGasEstimate(config, readOnlyProviders, feeEstimates);

  // If the user has no ETH to cover the bridge fees or approval fees then bridge cannot be an option
  if (!hasSufficientL1Eth(tokenBalanceResult, bridgeFeeEstimate)) return undefined;
  const gasForApproval = await estimateGasForBridgeApproval(config, readOnlyProviders, provider, balanceRequirement);
  if (!hasSufficientL1Eth(
    tokenBalanceResult,
    gasForApproval.add(bridgeFeeEstimate),
  )) return undefined;

  const l1address = await fetchL1Representation(config, balanceRequirement);
  if (l1address === '') return undefined;

  // Find the balance of the l1 representation of the token
  for (const balance of tokenBalanceResult.balances) {
    // check if enough eth for gas
    if (l1address === INDEXER_ETH_ROOT_CONTRACT_ADDRESS) {
      if (balance.balance.gte(balanceRequirement.delta.balance.add(bridgeFeeEstimate))) {
        return constructBridgeFundingRoute(chainId, balance);
      }
    }

    if (balance.token.address === l1address) {
      if (balance.balance.gte(balanceRequirement.delta.balance)) {
        return constructBridgeFundingRoute(chainId, balance);
      }
    }
  }

  return undefined;
};
