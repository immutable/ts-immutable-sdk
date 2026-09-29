import { TransactionRequest } from 'ethers';
import {
  FulfillmentTransaction, GasAmount, GasTokenType, ItemRequirement,
  ItemType, WrappedBrowserProvider, TransactionOrGasType,
} from '../../types';
import { InsufficientERC1155, InsufficientERC20, InsufficientERC721 } from '../allowance/types';
import { CheckoutError, CheckoutErrorType } from '../../errors';
import { getGasPriceInWei } from '../../gasEstimate';

export const estimateGas = async (
  provider: WrappedBrowserProvider,
  transaction: TransactionRequest,
): Promise<bigint> => {
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
  gas: bigint,
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

/**
 * Works out what the wallet must hold to pay for gas: every approval the
 * fulfilment needs plus the fulfilment itself (or a caller-supplied gas limit),
 * priced at the current gas price. estimateGas answers in gas units, so the
 * units are converted to a cost before they become a balance requirement.
 */
export const gasCalculator = async (
  provider: WrappedBrowserProvider,
  insufficientItems: (InsufficientERC20 | InsufficientERC721 | InsufficientERC1155)[],
  transactionOrGas: FulfillmentTransaction | GasAmount,
): Promise<ItemRequirement | null> => {
  const estimateGasPromises: Promise<bigint>[] = [];

  // Get all the gas estimate promises for the approval transactions
  for (const item of insufficientItems) {
    if (item.approvalTransaction === undefined) continue;
    estimateGasPromises.push(estimateGas(provider, item.approvalTransaction));
  }

  // If the transaction is a fulfillment transaction get the estimate gas promise
  // Otherwise the caller has supplied the gas limit directly
  if (transactionOrGas.type === TransactionOrGasType.TRANSACTION) {
    estimateGasPromises.push(estimateGas(provider, transactionOrGas.transaction));
  }

  const [feeData, gasEstimates] = await Promise.all([
    provider.getFeeData(),
    Promise.all(estimateGasPromises),
  ]);

  // Without a price the gas units cannot be turned into a balance requirement
  const gasPrice = getGasPriceInWei(feeData);
  if (gasPrice === null) return null;

  let totalGasUnits = gasEstimates.reduce((sum, gasEstimate) => sum + gasEstimate, BigInt(0));
  if (transactionOrGas.type === TransactionOrGasType.GAS) {
    totalGasUnits += transactionOrGas.gasToken.limit;
  }

  const totalGasCost = totalGasUnits * gasPrice;
  if (totalGasCost === BigInt(0)) return null;
  return getGasItemRequirement(totalGasCost, transactionOrGas);
};
