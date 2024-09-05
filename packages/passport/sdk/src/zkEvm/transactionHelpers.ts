import { BigNumber } from 'ethers';
import {
  StaticJsonRpcProvider,
  TransactionRequest,
} from '@ethersproject/providers';
import { Flow } from '@imtbl/metrics';
import { Signer } from '@ethersproject/abstract-signer';
import {
  getEip155ChainId,
  signMetaTransactions,
  encodedTransactions,
  getNormalisedTransactions,
  getNonce,
} from './walletHelpers';
import { RelayerClient } from './relayerClient';
import GuardianClient, { convertBigNumberishToString } from '../guardian';
import { FeeOption, MetaTransaction, RelayerTransactionStatus } from './types';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';
import { retryWithDelay } from '../network/retry';

const MAX_TRANSACTION_HASH_RETRIEVAL_RETRIES = 30;
const TRANSACTION_HASH_RETRIEVAL_WAIT = 1000;

export type TransactionParams = {
  ethSigner: Signer;
  rpcProvider: StaticJsonRpcProvider;
  guardianClient: GuardianClient;
  relayerClient: RelayerClient;
  zkEvmAddress: string;
  flow: Flow;
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

  const imxFeeOption = feeOptions.find(
    (feeOption) => feeOption.tokenSymbol === 'IMX',
  );
  if (!imxFeeOption) {
    throw new Error('Failed to retrieve fees for IMX token');
  }

  return imxFeeOption;
};

const buildMetaTransactions = async (
  transactionRequest: TransactionRequest,
  rpcProvider: StaticJsonRpcProvider,
  relayerClient: RelayerClient,
  zkevmAddress: string,
): Promise<[MetaTransaction, ...MetaTransaction[]]> => {
  if (!transactionRequest.to) {
    throw new JsonRpcError(
      RpcErrorCode.INVALID_PARAMS,
      'eth_sendTransaction requires a "to" field',
    );
  }

  const metaTransaction: MetaTransaction = {
    to: transactionRequest.to,
    data: transactionRequest.data,
    nonce: BigNumber.from(0),
    value: transactionRequest.value,
    revertOnError: true,
  };

  const [nonce, feeOption] = await Promise.all([
    getNonce(rpcProvider, zkevmAddress),
    getFeeOption(metaTransaction, zkevmAddress, relayerClient),
  ]);

  const metaTransactions: [MetaTransaction, ...MetaTransaction[]] = [
    {
      ...metaTransaction,
      nonce,
    },
  ];

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

export const pollRelayerTransaction = async (
  relayerClient: RelayerClient,
  relayerId: string,
  flow: Flow,
) => {
  const retrieveRelayerTransaction = async () => {
    const tx = await relayerClient.imGetTransactionByHash(relayerId);
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

export const prepareAndSignTransaction = async ({
  transactionRequest,
  ethSigner,
  rpcProvider,
  guardianClient,
  relayerClient,
  zkEvmAddress,
  flow,
}: TransactionParams & { transactionRequest: TransactionRequest }) => {
  const { chainId } = await rpcProvider.detectNetwork();
  const chainIdBigNumber = BigNumber.from(chainId);
  flow.addEvent('endDetectNetwork');

  const metaTransactions = await buildMetaTransactions(
    transactionRequest,
    rpcProvider,
    relayerClient,
    zkEvmAddress,
  );
  flow.addEvent('endBuildMetaTransactions');

  const { nonce } = metaTransactions[0];
  if (!nonce) {
    throw new Error('Failed to retrieve nonce from the smart wallet');
  }

  const validateEVMTransactionPromise = guardianClient.validateEVMTransaction({
    chainId: getEip155ChainId(chainId),
    nonce: convertBigNumberishToString(nonce),
    metaTransactions,
  });

  const getSignedMetaTransactionsPromise = signMetaTransactions(
    metaTransactions,
    nonce,
    chainIdBigNumber,
    zkEvmAddress,
    ethSigner,
  );

  const [, signedTransactions] = await Promise.all([
    validateEVMTransactionPromise,
    getSignedMetaTransactionsPromise,
  ]);

  flow.addEvent('endValidateEVMTransaction');
  flow.addEvent('endGetSignedMetaTransactions');

  const relayerId = await relayerClient.ethSendTransaction(zkEvmAddress, signedTransactions);
  flow.addEvent('endRelayerSendTransaction');

  return { signedTransactions, relayerId, nonce };
};
