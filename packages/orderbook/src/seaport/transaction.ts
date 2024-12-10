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
    const contractTransaction = await transactionMethods.buildTransaction();

    const preparedTransactionRequest: PreparedTransactionRequest = {
      to: contractTransaction.to,
      from: callerAddress,
      type: contractTransaction.type,
      maxFeePerGas: contractTransaction.maxFeePerGas
        ? BigInt(contractTransaction.maxFeePerGas)
        : undefined,
      maxPriorityFeePerGas: contractTransaction.maxPriorityFeePerGas
        ? BigInt(contractTransaction.maxPriorityFeePerGas)
        : undefined,
      value: contractTransaction.value ? BigInt(contractTransaction.value) : undefined,
      data: contractTransaction.data,
      nonce: contractTransaction.nonce,
      chainId,
    };

    preparedTransactionRequest.gasLimit = BigInt(await transactionMethods.estimateGas());
    preparedTransactionRequest.gasLimit += (preparedTransactionRequest.gasLimit / BigInt(5));

    return preparedTransactionRequest;
  };
}
