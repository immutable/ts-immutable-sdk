import { JsonRpcError, RpcErrorCode } from './errors';
import type { TransactionRequest } from './metatransaction';
import { buildMetaTransaction } from './metatransaction';
import { signMetaTransactions } from './sequence';
import type { Signer } from './signer/signer';

/**
 * Ejection transaction response
 */
export interface EjectionTransactionResponse {
  to: string;
  data: string;
  chainId: string;
}

/**
 * Prepares and signs ejection transaction
 * Ejection transactions are simpler - no fee, no Guardian validation, no relayer
 * Just sign the transaction and return it for the user to submit elsewhere
 */
export async function prepareAndSignEjectionTransaction({
  transactionRequest,
  ethSigner,
  zkEvmAddress,
  chainId,
}: {
  transactionRequest: TransactionRequest;
  ethSigner: Signer;
  zkEvmAddress: string;
  chainId: number;
}): Promise<EjectionTransactionResponse> {
  if (!transactionRequest.to || typeof transactionRequest.to !== 'string') {
    throw new JsonRpcError(
      RpcErrorCode.INVALID_PARAMS,
      'im_signEjectionTransaction requires a "to" field'
    );
  }

  if (typeof transactionRequest.nonce === 'undefined') {
    throw new JsonRpcError(
      RpcErrorCode.INVALID_PARAMS,
      'im_signEjectionTransaction requires a "nonce" field'
    );
  }

  if (!transactionRequest.chainId) {
    throw new JsonRpcError(
      RpcErrorCode.INVALID_PARAMS,
      'im_signEjectionTransaction requires a "chainId" field'
    );
  }

  // Convert to MetaTransaction (same as normal transactions)
  const metaTransaction = buildMetaTransaction(transactionRequest);
  const nonce = typeof transactionRequest.nonce === 'number'
    ? BigInt(transactionRequest.nonce)
    : transactionRequest.nonce!;
  const chainIdBigInt = BigInt(chainId);

  // Sign the transaction
  const signedTransaction = await signMetaTransactions(
    [metaTransaction],
    nonce,
    chainIdBigInt,
    zkEvmAddress,
    ethSigner
  );

  return {
    to: zkEvmAddress,
    data: signedTransaction,
    chainId: `eip155:${chainId}`,
  };
}