import { BigNumber } from 'ethers';
import { StaticJsonRpcProvider, TransactionRequest } from '@ethersproject/providers';
import { Flow } from '@imtbl/metrics';
import { Signer } from '@ethersproject/abstract-signer';
import {
  encodedTransactions,
  getEip155ChainId,
  getNonce,
  getNormalisedTransactions,
  signMetaTransactions,
} from './walletHelpers';
import { FeeOption, MetaTransaction, RelayerTransactionStatus } from './types';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';
import { retryWithDelay } from '../network/retry';
import { RelayerClient } from './relayerClient';
import GuardianClient, { convertBigNumberishToString } from '../guardian';

const MAX_TRANSACTION_HASH_RETRIEVAL_RETRIES = 30;
const TRANSACTION_HASH_RETRIEVAL_WAIT = 1000;

export type EthSendTransactionParams = {
  ethSigner: Signer;
  rpcProvider: StaticJsonRpcProvider;
  guardianClient: GuardianClient;
  relayerClient: RelayerClient;
  zkevmAddress: string,
  params: Array<any>;
  flow: Flow;
};

const getFeeOption = async (
  metaTransaction: MetaTransaction,
  walletAddress: string,
  relayerClient: RelayerClient,
): Promise<FeeOption> => {
  const normalisedMetaTransaction = getNormalisedTransactions([metaTransaction]);
  const transactions = encodedTransactions(normalisedMetaTransaction);
  const feeOptions = await relayerClient.imGetFeeOptions(walletAddress, transactions);

  const imxFeeOption = feeOptions.find((feeOption) => feeOption.tokenSymbol === 'IMX');
  if (!imxFeeOption) {
    throw new Error('Failed to retrieve fees for IMX token');
  }

  return imxFeeOption;
};

/**
 * Prepares the meta transactions array to be signed by estimating the fee and
 * getting the nonce from the smart wallet.
 *
 */
const buildMetaTransactions = async (
  transactionRequest: TransactionRequest,
  rpcProvider: StaticJsonRpcProvider,
  relayerClient: RelayerClient,
  zkevmAddress: string,
): Promise<[MetaTransaction, ...MetaTransaction[]]> => {
  if (!transactionRequest.to) {
    throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, 'eth_sendTransaction requires a "to" field');
  }

  const metaTransaction: MetaTransaction = {
    to: transactionRequest.to,
    data: transactionRequest.data,
    nonce: BigNumber.from(0), // NOTE: We don't need a valid nonce to estimate the fee
    value: transactionRequest.value,
    revertOnError: true,
  };

  // Estimate the fee and get the nonce from the smart wallet
  const [nonce, feeOption] = await Promise.all([
    getNonce(rpcProvider, zkevmAddress),
    getFeeOption(metaTransaction, zkevmAddress, relayerClient),
  ]);

  // Build the meta transactions array with a valid nonce and fee transaction
  const metaTransactions: [MetaTransaction, ...MetaTransaction[]] = [{
    ...metaTransaction,
    nonce,
  }];
  // Add a fee transaction if the fee is non-zero
  const feeValue = BigNumber.from(feeOption.tokenPrice);
  if (!feeValue.isZero()) {
    metaTransactions.push({
      nonce,
      to: feeOption.recipientAddress,
      value: feeValue,
      revertOnError: true,
    });
  }

  return metaTransactions;
};

export const sendTransaction = async ({
  params,
  ethSigner,
  rpcProvider,
  relayerClient,
  guardianClient,
  zkevmAddress,
  flow,
}: EthSendTransactionParams): Promise<string> => {
  const { chainId } = await rpcProvider.detectNetwork();
  const chainIdBigNumber = BigNumber.from(chainId);
  flow.addEvent('endDetectNetwork');

  // Prepare the meta transactions by adding an optional fee transaction
  const metaTransactions = await buildMetaTransactions(
    params[0],
    rpcProvider,
    relayerClient,
    zkevmAddress,
  );
  flow.addEvent('endBuildMetaTransactions');

  const { nonce } = metaTransactions[0];
  if (!nonce) {
    throw new Error('Failed to retrieve nonce from the smart wallet');
  }

  // Parallelize the validation and signing of the transaction
  const validateEVMTransactionPromise = guardianClient.validateEVMTransaction({
    chainId: getEip155ChainId(chainId),
    nonce: convertBigNumberishToString(nonce),
    metaTransactions,
  });
  validateEVMTransactionPromise.then(() => flow.addEvent('endValidateEVMTransaction'));

  // NOTE: We sign again because we now are adding the fee transaction, so the
  // whole payload is different and needs a new signature.
  const getSignedMetaTransactionsPromise = signMetaTransactions(
    metaTransactions,
    nonce,
    chainIdBigNumber,
    zkevmAddress,
    ethSigner,
  );
  getSignedMetaTransactionsPromise.then(() => flow.addEvent('endGetSignedMetaTransactions'));

  const [, signedTransactions] = await Promise.all([
    validateEVMTransactionPromise,
    getSignedMetaTransactionsPromise,
  ]);

  const relayerId = await relayerClient.ethSendTransaction(zkevmAddress, signedTransactions);
  flow.addEvent('endRelayerSendTransaction');

  const retrieveRelayerTransaction = async () => {
    const tx = await relayerClient.imGetTransactionByHash(relayerId);
    // NOTE: The transaction hash is only available from the Relayer once the
    // transaction is actually submitted onchain. Hence we need to poll the
    // Relayer get transaction endpoint until the status transitions to one that
    // has the hash available.
    if (tx.status === RelayerTransactionStatus.PENDING) {
      throw new Error();
    }
    return tx;
  };

  const relayerTransaction = await retryWithDelay(retrieveRelayerTransaction, {
    retries: MAX_TRANSACTION_HASH_RETRIEVAL_RETRIES,
    interval: TRANSACTION_HASH_RETRIEVAL_WAIT,
    finalErr: new JsonRpcError(RpcErrorCode.RPC_SERVER_ERROR, 'transaction hash not generated in time'),
  });
  flow.addEvent('endRetrieveRelayerTransaction');

  if (![
    RelayerTransactionStatus.SUBMITTED,
    RelayerTransactionStatus.SUCCESSFUL,
  ].includes(relayerTransaction.status)) {
    let errorMessage = `Transaction failed to submit with status ${relayerTransaction.status}.`;
    if (relayerTransaction.statusMessage) {
      errorMessage += ` Error message: ${relayerTransaction.statusMessage}`;
    }
    throw new JsonRpcError(
      RpcErrorCode.RPC_SERVER_ERROR,
      errorMessage,
    );
  }

  return relayerTransaction.hash;
};
