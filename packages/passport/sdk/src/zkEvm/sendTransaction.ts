import { BigNumber, BigNumberish } from 'ethers';
import {
  StaticJsonRpcProvider,
  TransactionRequest,
} from '@ethersproject/providers';
import { Flow } from '@imtbl/metrics';
import { Signer } from '@ethersproject/abstract-signer';
import { getEip155ChainId, getNonce, getSignedMetaTransactions } from './walletHelpers';
import { MetaTransaction, RelayerTransactionStatus } from './types';
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

const getMetaTransactions = async (
  metaTransaction: MetaTransaction,
  nonce: BigNumberish,
  chainId: BigNumber,
  walletAddress: string,
  signer: Signer,
  relayerClient: RelayerClient,
): Promise<MetaTransaction[]> => {
  // NOTE: We sign the transaction before getting the fee options because
  // accurate estimation of a transaction gas cost is only possible if the smart
  // wallet contract can actually execute it (in a simulated environment) - and
  // it can only execute signed transactions.
  const signedTransaction = await getSignedMetaTransactions(
    [metaTransaction],
    nonce,
    chainId,
    walletAddress,
    signer,
  );

  // TODO: ID-698 Add support for non-native gas payments (e.g ERC20, feeTransaction initialisation must change)

  // NOTE: "Fee Options" represent the multiple ways we could pay for the gas
  // used in this transaction. Each fee option has a "recipientAddress" we
  // should transfer the payment to, an amount and a currency. We choose one
  // option and build a transaction that sends the expected currency amount for
  // that option to the specified address.
  const feeOptions = await relayerClient.imGetFeeOptions(walletAddress, signedTransaction);
  const imxFeeOption = feeOptions.find((feeOption) => feeOption.tokenSymbol === 'IMX');
  if (!imxFeeOption) {
    throw new Error('Failed to retrieve fees for IMX token');
  }

  const feeMetaTransaction: MetaTransaction = {
    nonce,
    to: imxFeeOption.recipientAddress,
    value: imxFeeOption.tokenPrice,
    revertOnError: true,
  };
  if (BigNumber.from(feeMetaTransaction.value).isZero()) {
    return [metaTransaction];
  }
  return [metaTransaction, feeMetaTransaction];
};

/**
 * Send the transaction to the relayer, which will submit it to the zkEVM chain.
 * @param params - The parameters of the transaction.
 * @param ethSigner - The signer to sign the transaction.
 * @param rpcProvider - The provider to get the chain ID.
 * @param relayerClient - The client to interact with the relayer.
 * @param guardianClient - The client to interact with the guardian.
 * @param zkevmAddress - The address of the zkEVM wallet.
 * @returns The transaction hash.
 * @throws JsonRpcError if there is an error sending the transaction.
 * @remarks A returned transaction hash does not guarantee that the transaction was successful.
 *          The transaction hash only indicates that the transaction was submitted onchain.
 *          The caller should poll the transaction status to determine if the transaction was successful.
 * @see [Blockchain Data APIs - Polling](https://docs.immutable.com/docs/zkevm/products/blockchain-data/polling/)
 */
export const sendTransaction = async ({
  params,
  ethSigner,
  rpcProvider,
  relayerClient,
  guardianClient,
  zkevmAddress,
  flow,
}: EthSendTransactionParams): Promise<string> => {
  const transactionRequest: TransactionRequest = params[0];
  if (!transactionRequest.to) {
    throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, 'eth_sendTransaction requires a "to" field');
  }

  const { chainId } = await rpcProvider.detectNetwork();
  const chainIdBigNumber = BigNumber.from(chainId);
  flow.addEvent('endDetectNetwork');

  const nonce = await getNonce(rpcProvider, zkevmAddress);
  flow.addEvent('endGetNonce');

  const metaTransaction: MetaTransaction = {
    to: transactionRequest.to,
    data: transactionRequest.data,
    nonce,
    value: transactionRequest.value,
    revertOnError: true,
  };

  const metaTransactions = await getMetaTransactions(
    metaTransaction,
    nonce,
    chainIdBigNumber,
    zkevmAddress,
    ethSigner,
    relayerClient,
  );
  flow.addEvent('endGetMetaTransactions');

  // Parallelize the validation and signing of the transaction
  const validateEVMTransactionPromise = guardianClient.validateEVMTransaction({
    chainId: getEip155ChainId(chainId),
    nonce: convertBigNumberishToString(nonce),
    metaTransactions,
  });
  validateEVMTransactionPromise.then(() => flow.addEvent('endValidateEVMTransaction'));

  // NOTE: We sign again because we now are adding the fee transaction, so the
  // whole payload is different and needs a new signature.
  const getSignedMetaTransactionsPromise = getSignedMetaTransactions(
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
