import { Flow } from '@imtbl/metrics';
import {
  Signer, TransactionRequest, JsonRpcProvider,
} from 'ethers';
import {
  getEip155ChainId,
  signMetaTransactions,
  encodedTransactions,
  getNormalisedTransactions,
  getNonce,
} from './walletHelpers';
import { RelayerClient } from './relayerClient';
import GuardianClient from '../guardian';
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
  ethSigner: Signer;
  rpcProvider: JsonRpcProvider;
  guardianClient: GuardianClient;
  relayerClient: RelayerClient;
  zkEvmAddress: string;
  flow: Flow;
  nonceSpace?: bigint;
  isBackgroundTransaction?: boolean;
};

export type EjectionTransactionParams = Pick<TransactionParams, 'ethSigner' | 'zkEvmAddress' | 'flow'>;
export type EjectionTransactionResponse = {
  to: string;
  data: string;
  chainId: string;
};

const getFeeOption = async (
  metaTransaction: MetaTransaction,
  walletAddress: string,
  relayerClient: RelayerClient,
): Promise<FeeOption> => {
  const normalisedMetaTransaction = getNormalisedTransactions([
    metaTransaction,
  ]);
  const transactions = encodedTransactions(normalisedMetaTransaction);
  const feeOptions = await relayerClient.imGetFeeOptions(
    walletAddress,
    transactions,
  );

  if (!feeOptions || !Array.isArray(feeOptions)) {
    throw new Error('Invalid fee options received from relayer');
  }

  const imxFeeOption = feeOptions.find(
    (feeOption) => feeOption.tokenSymbol === 'IMX',
  );
  if (!imxFeeOption) {
    throw new Error('Failed to retrieve fees for IMX token');
  }

  return imxFeeOption;
};

/**
 * Prepares the meta transactions array to be signed by estimating the fee and
 * getting the nonce from the smart wallet.
 */
const buildMetaTransactions = async (
  transactionRequest: TransactionRequest,
  relayerClient: RelayerClient,
  zkevmAddress: string,
  flow: Flow,
): Promise<MetaTransaction[]> => {
  if (!transactionRequest.to) {
    throw new JsonRpcError(
      RpcErrorCode.INVALID_PARAMS,
      'eth_sendTransaction requires a "to" field',
    );
  }

  const metaTransactions: MetaTransaction[] = [{
    to: transactionRequest.to.toString(),
    data: transactionRequest.data,
    value: transactionRequest.value,
    revertOnError: true,
  }];

  // Estimate the fee and get the nonce from the smart wallet
  const feeOption = await getFeeOption(metaTransactions[0], zkevmAddress, relayerClient);

  // Add a fee transaction if the fee is non-zero
  const feeValue = BigInt(feeOption.tokenPrice);
  if (feeValue !== BigInt(0)) {
    metaTransactions.push({
      to: feeOption.recipientAddress,
      value: feeValue,
      revertOnError: true,
    });
  }

  flow.addEvent('endBuildMetaTransactions');
  return metaTransactions;
};

export const pollRelayerTransaction = async (
  relayerClient: RelayerClient,
  relayerId: string,
  flow: Flow,
) => {
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
    finalErr: new JsonRpcError(
      RpcErrorCode.RPC_SERVER_ERROR,
      'transaction hash not generated in time',
    ),
  });
  flow.addEvent('endRetrieveRelayerTransaction');

  if (
    ![
      RelayerTransactionStatus.SUBMITTED,
      RelayerTransactionStatus.SUCCESSFUL,
    ].includes(relayerTransaction.status)
  ) {
    let errorMessage = `Transaction failed to submit with status ${relayerTransaction.status}.`;
    if (relayerTransaction.statusMessage) {
      errorMessage += ` Error message: ${relayerTransaction.statusMessage}`;
    }
    throw new JsonRpcError(RpcErrorCode.RPC_SERVER_ERROR, errorMessage);
  }

  return relayerTransaction;
};

const detectNetwork = async (rpcProvider: JsonRpcProvider, flow: Flow) => {
  const network = await rpcProvider.getNetwork();
  flow.addEvent('endDetectNetwork');
  return network;
};

export const prepareAndSignTransaction = async ({
  transactionRequest,
  ethSigner,
  rpcProvider,
  guardianClient,
  relayerClient,
  zkEvmAddress,
  flow,
  nonceSpace,
  isBackgroundTransaction,
}: TransactionParams & { transactionRequest: TransactionRequest }) => {
  const [metaTransactions, nonce, network] = await Promise.all([
    buildMetaTransactions(
      transactionRequest,
      relayerClient,
      zkEvmAddress,
      flow,
    ),
    getNonce(rpcProvider, zkEvmAddress, nonceSpace),
    detectNetwork(rpcProvider, flow),
  ]);

  // Parallelize the validation and signing of the transaction
  // without waiting for the validation to complete
  const validateTransaction = async () => {
    await guardianClient.validateEVMTransaction({
      chainId: getEip155ChainId(Number(network.chainId)),
      nonce: nonce.toString(),
      metaTransactions,
      isBackgroundTransaction,
    });
    flow.addEvent('endValidateEVMTransaction');
  };

  // NOTE: We sign again because we now are adding the fee transaction, so the
  // whole payload is different and needs a new signature.
  const signTransaction = async () => {
    const signed = await signMetaTransactions(
      metaTransactions,
      nonce,
      network.chainId,
      zkEvmAddress,
      ethSigner,
    );
    flow.addEvent('endGetSignedMetaTransactions');
    return signed;
  };

  const [, signedTransactions] = await Promise.all([
    validateTransaction(),
    signTransaction(),
  ]);

  const relayerId = await relayerClient.ethSendTransaction(zkEvmAddress, signedTransactions);
  flow.addEvent('endRelayerSendTransaction');

  return { signedTransactions, relayerId, nonce };
};

const buildMetaTransactionForEjection = async (
  transactionRequest: TransactionRequest,
): Promise<MetaTransaction> => {
  if (!transactionRequest.to) {
    throw new JsonRpcError(
      RpcErrorCode.INVALID_PARAMS,
      'im_signEjectionTransaction requires a "to" field',
    );
  }

  const metaTransaction: MetaTransaction = {
    to: transactionRequest.to.toString(),
    data: transactionRequest.data,
    value: transactionRequest.value,
    revertOnError: true,
  };

  return metaTransaction;
};

const parseNonce = (transactionRequest: TransactionRequest): bigint => {
  if (typeof transactionRequest.nonce === 'undefined' || transactionRequest.nonce === null) {
    throw new JsonRpcError(
      RpcErrorCode.INVALID_PARAMS,
      'im_signEjectionTransaction requires a "nonce" field',
    );
  }
  return BigInt(transactionRequest.nonce);
};

const parseChainId = (transactionRequest: TransactionRequest): bigint => {
  if (typeof transactionRequest.chainId === 'undefined' || transactionRequest.chainId === null) {
    throw new JsonRpcError(
      RpcErrorCode.INVALID_PARAMS,
      'im_signEjectionTransaction requires a "chainId" field',
    );
  }
  return BigInt(transactionRequest.chainId);
};

export const prepareAndSignEjectionTransaction = async ({
  transactionRequest,
  ethSigner,
  zkEvmAddress,
  flow,
}: EjectionTransactionParams & { transactionRequest: TransactionRequest }): Promise<EjectionTransactionResponse> => {
  const nonce = parseNonce(transactionRequest);
  const chainId = parseChainId(transactionRequest);
  const metaTransaction = await buildMetaTransactionForEjection(
    transactionRequest,
  );
  flow.addEvent('endBuildMetaTransactions');

  const signedTransaction = await signMetaTransactions(
    [metaTransaction],
    nonce,
    chainId,
    zkEvmAddress,
    ethSigner,
  );
  flow.addEvent('endGetSignedMetaTransactions');

  return {
    to: zkEvmAddress,
    data: signedTransaction,
    chainId: getEip155ChainId(Number(transactionRequest.chainId ?? 0)),
  };
};
