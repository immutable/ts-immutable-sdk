import { TransactionMethods } from '@opensea/seaport-js/lib/utils/usecase';
import { PopulatedTransaction, BigNumber } from 'ethers';
import { TransactionBuilder } from 'types';

// Add 20% more gas than estimate to prevent out of gas errors
// This can always be overwritten by the user signing the transaction
export function prepareTransaction(
  transactionMethods: TransactionMethods,
  // chainId is required for EIP155
  chainId: number,
): TransactionBuilder {
  return async () => {
    const v6ContractTransaction = await transactionMethods.buildTransaction();

    const v5PopulatedTransaction: PopulatedTransaction = {
      to: v6ContractTransaction.to,
      from: v6ContractTransaction.from,
      type: v6ContractTransaction.type,
      maxFeePerGas: v6ContractTransaction.maxFeePerGas
        ? BigNumber.from(v6ContractTransaction.maxFeePerGas)
        : undefined,
      maxPriorityFeePerGas: v6ContractTransaction.maxPriorityFeePerGas
        ? BigNumber.from(v6ContractTransaction.maxPriorityFeePerGas)
        : undefined,
      accessList: v6ContractTransaction.accessList,
      customData: v6ContractTransaction.customData,
      value: v6ContractTransaction.value ? BigNumber.from(v6ContractTransaction.value) : undefined,
      data: v6ContractTransaction.data,
      nonce: v6ContractTransaction.nonce,
      chainId,
    };

    v5PopulatedTransaction.gasLimit = BigNumber.from(await transactionMethods.estimateGas());
    v5PopulatedTransaction.gasLimit = v5PopulatedTransaction.gasLimit
      .add(v5PopulatedTransaction.gasLimit.div(5));

    return v5PopulatedTransaction;
  };
}
