import { FeeData, TransactionRequest, Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import {
  FulfilmentTransaction, GasAmount, GasTokenType, ItemRequirement, ItemType, TransactionOrGasType,
} from '../../types';
import { InsufficientERC20, InsufficientERC721 } from '../allowance/types';
import { CheckoutError, CheckoutErrorType } from '../../errors';

const doesChainSupportEIP1559 = (feeData: FeeData) => !!feeData.maxFeePerGas && !!feeData.maxPriorityFeePerGas;

const getGasPriceInWei = (feeData: FeeData): BigNumber | undefined => {
  if (doesChainSupportEIP1559(feeData)) {
    return BigNumber.from(feeData.maxFeePerGas).add(
      BigNumber.from(feeData.maxPriorityFeePerGas),
    );
  }
  if (feeData.gasPrice) return BigNumber.from(feeData.gasPrice);
  return undefined;
};

export const estimateGas = async (
  provider: Web3Provider,
  transaction: TransactionRequest,
): Promise<BigNumber> => {
  try {
    return await provider.estimateGas(transaction);
  } catch (err: any) {
    throw new CheckoutError(
      'Failed to estimate gas for transaction',
      CheckoutErrorType.UNPREDICTABLE_GAS_LIMIT,
    );
  }
};

export const getGasItemRequirement = (
  gas: BigNumber,
  transactionOrGas: FulfilmentTransaction | GasAmount,
): ItemRequirement => {
  if (transactionOrGas.type === TransactionOrGasType.TRANSACTION
    || transactionOrGas.gasToken.type === GasTokenType.NATIVE) {
    return {
      type: ItemType.NATIVE,
      amount: gas,
    };
  }

  return {
    type: ItemType.ERC20,
    amount: gas,
    contractAddress: transactionOrGas.gasToken.contractAddress,
    spenderAddress: '',
  };
};

export const gasCalculator = async (
  provider: Web3Provider,
  insufficientItems: (InsufficientERC20 | InsufficientERC721)[],
  transactionOrGas: FulfilmentTransaction | GasAmount,
): Promise<ItemRequirement> => {
  const estimateGasPromises = [];
  let totalGas = BigNumber.from(0);

  // Get all the gas estimate promises for the approval transactions
  for (const item of insufficientItems) {
    if (item.approvalTransaction === undefined) continue;
    estimateGasPromises.push(estimateGas(provider, item.approvalTransaction));
  }

  // If the transaction is a fulfilment transaction get the estimate gas promise
  // Otherwise use the gas amount with the limit to estimate the gas
  if (transactionOrGas.type === TransactionOrGasType.TRANSACTION) {
    estimateGasPromises.push(estimateGas(provider, transactionOrGas.transaction));
  } else {
    const feeData = await provider.getFeeData();
    const gasPrice = getGasPriceInWei(feeData);
    const gas = gasPrice?.mul(transactionOrGas.gasToken.limit);
    if (gas) totalGas = totalGas.add(gas);
  }

  // Get the gas estimates for all the transactions and calculate the total gas
  const gasEstimatePromises = await Promise.all(estimateGasPromises);
  gasEstimatePromises.forEach((gasEstimate) => {
    totalGas = totalGas.add(gasEstimate);
  });

  return getGasItemRequirement(totalGas, transactionOrGas);
};
