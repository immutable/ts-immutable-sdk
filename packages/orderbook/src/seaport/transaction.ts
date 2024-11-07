import type { TransactionMethods } from '@opensea/seaport-js/lib/utils/usecase';
import { PreparedTransactionRequest } from 'ethers';
import { TransactionBuilder } from '../types';

// Add 20% more gas than estimate to prevent out of gas errors
// This can always be overwritten by the user signing the transaction
export function prepareTransaction(
  transactionMethods: TransactionMethods,
  // chainId is required for EIP155
  chainId: bigint,
  callerAddress: string,
): TransactionBuilder {
  return async () => {
    const v6ContractTransaction = await transactionMethods.buildTransaction();

    const v5PopulatedTransaction: PreparedTransactionRequest = {
      to: v6ContractTransaction.to,
      from: callerAddress,
      type: v6ContractTransaction.type,
      maxFeePerGas: v6ContractTransaction.maxFeePerGas
        ? BigInt(v6ContractTransaction.maxFeePerGas)
        : undefined,
      maxPriorityFeePerGas: v6ContractTransaction.maxPriorityFeePerGas
        ? BigInt(v6ContractTransaction.maxPriorityFeePerGas)
        : undefined,
      value: v6ContractTransaction.value ? BigInt(v6ContractTransaction.value) : undefined,
      data: v6ContractTransaction.data,
      nonce: v6ContractTransaction.nonce,
      chainId,
    };

    v5PopulatedTransaction.gasLimit = BigInt(await transactionMethods.estimateGas());
    v5PopulatedTransaction.gasLimit += (v5PopulatedTransaction.gasLimit / BigInt(5));

    return v5PopulatedTransaction;
  };
}
