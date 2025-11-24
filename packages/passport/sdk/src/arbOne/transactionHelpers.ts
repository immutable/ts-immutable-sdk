import { Flow } from '@imtbl/metrics';
import {
  Signer, TransactionRequest, JsonRpcProvider,
} from 'ethers';
import {
  getNonce,
  getNormalisedTransactions,
  signMetaTransactions,
} from './walletHelpers';
import { ArbOneRelayerClient } from './relayerClient';
import {
  FeeOption,
  MetaTransaction,
  RelayerTransactionStatus,
} from './types';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';
import { retryWithDelay } from '../network/retry';

const MAX_TRANSACTION_HASH_RETRIEVAL_RETRIES = 30;
const TRANSACTION_HASH_RETRIEVAL_WAIT = 1000;

export type TransactionParams = {
  sequenceSigner: Signer;
  rpcProvider: JsonRpcProvider;
  relayerClient: ArbOneRelayerClient;
  arbOneAddress: string;
  flow: Flow;
  nonceSpace?: bigint;
  isBackgroundTransaction?: boolean;
};

// Fee payment no longer needed - relayer sponsors gas
// const getFeeOption = async (
//   metaTransaction: MetaTransaction,
//   walletAddress: string,
//   relayerClient: ArbOneRelayerClient,
// ): Promise<FeeOption> => {
//   const normalisedMetaTransaction = getNormalisedTransactions([
//     metaTransaction,
//   ]);
//   const transactions = encodedTransactions(normalisedMetaTransaction);
//   const feeOptions = await relayerClient.imGetFeeOptions(
//     walletAddress,
//     transactions,
//   );
//
//   if (!feeOptions || !Array.isArray(feeOptions)) {
//     throw new Error('Invalid fee options received from relayer');
//   }
//
//   console.log('feeOptions', JSON.stringify(feeOptions));
//
//   // For Arbitrum One, look for ETH fee option (instead of IMX)
//   const ethFeeOption = feeOptions.find(
//     (feeOption) => feeOption.tokenSymbol === 'ETH',
//   );
//   if (!ethFeeOption) {
//     throw new Error('Failed to retrieve fees for ETH token');
//   }
//
//   return ethFeeOption;
// };

/**
 * Build meta transactions for Arbitrum One
 * No fee transaction needed - relayer sponsors gas
 */
const buildMetaTransactions = async (
  transactionRequest: TransactionRequest,
  rpcProvider: JsonRpcProvider,
  relayerClient: ArbOneRelayerClient,
  arbOneAddress: string,
  nonceSpace?: bigint,
): Promise<[MetaTransaction, ...MetaTransaction[]]> => {
  if (!transactionRequest.to) {
    throw new JsonRpcError(
      RpcErrorCode.INVALID_PARAMS,
      'eth_sendTransaction requires a "to" field',
    );
  }

  // Get the nonce from the smart wallet
  const nonce = await getNonce(rpcProvider, arbOneAddress, nonceSpace);
  console.log('buildMetaTransactions nonce', nonce);

  const metaTransaction: MetaTransaction = {
    to: transactionRequest.to.toString(),
    data: transactionRequest.data,
    nonce,
    value: transactionRequest.value,
    revertOnError: true,
  };

  // Return just the user's transaction - no fee transaction needed
  return [metaTransaction];
};

/**
 * Prepare and sign transaction using Sequence wallet
 * This generates the user's signature which relayer will combine with its own (2x2 multisig)
 * Supports both V1 and V3 contract formats
 */
export const prepareAndSignTransaction = async ({
  transactionRequest,
  sequenceSigner,
  rpcProvider,
  relayerClient,
  arbOneAddress,
  flow,
  nonceSpace,
}: TransactionParams & { transactionRequest: TransactionRequest }): Promise<{ relayerId: string }> => {
  flow.addEvent('startBuildMetaTransactions');

  const metaTransactions = await buildMetaTransactions(
    transactionRequest,
    rpcProvider,
    relayerClient,
    arbOneAddress,
    nonceSpace,
  );

  flow.addEvent('endBuildMetaTransactions');

  const nonce = metaTransactions[0].nonce!;

  flow.addEvent('startSignMetaTransactions');

  const { chainId } = await rpcProvider.getNetwork();

  const signedTransaction = await signMetaTransactions(
        metaTransactions,
        nonce,
        BigInt(chainId.toString()),
        arbOneAddress,
        sequenceSigner,
      );

  flow.addEvent('endSignMetaTransactions');

  flow.addEvent('startSubmitToRelayer');

  // Send to relayer - relayer will add its own signature and submit on-chain
  // On first transaction, this will deploy the smart contract wallet
  const relayerId = await relayerClient.ethSendTransaction(
    arbOneAddress,
    signedTransaction,
  );

  flow.addEvent('endSubmitToRelayer');

  return { relayerId };
};

/**
 * Poll relayer for transaction status
 * Same as zkEVM - waits for relayer to process and submit transaction
 */
export const pollRelayerTransaction = async (
  relayerClient: ArbOneRelayerClient,
  relayerId: string,
  flow: Flow,
): Promise<{ hash: string }> => {
  flow.addEvent('startPollRelayerTransaction');

  const result = await retryWithDelay(
    async () => {
      const transaction = await relayerClient.imGetTransactionByHash(relayerId);

      if (transaction.status === RelayerTransactionStatus.SUCCESSFUL) {
        return { hash: transaction.hash };
      }

      if (
        transaction.status === RelayerTransactionStatus.FAILED
        || transaction.status === RelayerTransactionStatus.REVERTED
        || transaction.status === RelayerTransactionStatus.CANCELLED
      ) {
        throw new JsonRpcError(
          RpcErrorCode.INTERNAL_ERROR,
          transaction.statusMessage || 'Transaction failed',
        );
      }

      // Transaction still pending, retry
      throw new Error('Transaction pending');
    },
    {
      retries: MAX_TRANSACTION_HASH_RETRIEVAL_RETRIES,
      interval: TRANSACTION_HASH_RETRIEVAL_WAIT,
      finalErr: new JsonRpcError(
        RpcErrorCode.INTERNAL_ERROR,
        'Transaction polling timeout',
      ),
    },
  );

  flow.addEvent('endPollRelayerTransaction');

  return result;
};

