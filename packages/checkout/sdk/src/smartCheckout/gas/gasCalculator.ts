import { TransactionRequest, Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import {
  FulfillmentTransaction, GasAmount, GasTokenType, ItemRequirement, ItemType, TransactionOrGasType,
} from '../../types';
import { InsufficientERC1155, InsufficientERC20, InsufficientERC721 } from '../allowance/types';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import { getGasPriceInWei } from '../../gasEstimate';

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
      { error: err },
    );
  }
};

export const getGasItemRequirement = (
  gas: BigNumber,
  transactionOrGas: FulfillmentTransaction | GasAmount,
): ItemRequirement => {
  if (transactionOrGas.type === TransactionOrGasType.TRANSACTION
    || transactionOrGas.gasToken.type === GasTokenType.NATIVE) {
    return {
      type: ItemType.NATIVE,
      amount: gas,
      isFee: true,
    };
  }

  return {
    type: ItemType.ERC20,
    amount: gas,
    tokenAddress: transactionOrGas.gasToken.tokenAddress,
    spenderAddress: '',
    isFee: true,
  };
};

export const gasCalculator = async (
  provider: Web3Provider,
  insufficientItems: (InsufficientERC20 | InsufficientERC721 | InsufficientERC1155)[],
  transactionOrGas: FulfillmentTransaction | GasAmount,
): Promise<ItemRequirement | null> => {
  const estimateGasPromises = [];
  let totalGas = BigNumber.from(0);

  // Get all the gas estimate promises for the approval transactions
  for (const item of insufficientItems) {
    if (item.approvalTransaction === undefined) continue;
    estimateGasPromises.push(estimateGas(provider, item.approvalTransaction));
  }

  // If the transaction is a fulfillment transaction get the estimate gas promise
  // Otherwise use the gas amount with the limit to estimate the gas
  if (transactionOrGas.type === TransactionOrGasType.TRANSACTION) {
    estimateGasPromises.push(estimateGas(provider, transactionOrGas.transaction));
  } else {
    const feeData = await provider.getFeeData();
    const gasPrice = getGasPriceInWei(feeData);
    if (gasPrice !== null) {
      const gas = gasPrice?.mul(transactionOrGas.gasToken.limit);
      if (gas) totalGas = totalGas.add(gas);
    }
  }

  // Get the gas estimates for all the transactions and calculate the total gas
  const gasEstimatePromises = await Promise.all(estimateGasPromises);
  gasEstimatePromises.forEach((gasEstimate) => {
    totalGas = totalGas.add(gasEstimate);
  });

  if (totalGas.eq(0)) return null;
  return getGasItemRequirement(totalGas, transactionOrGas);
};
