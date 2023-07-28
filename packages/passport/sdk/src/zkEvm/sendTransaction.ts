import {
  ExternalProvider, JsonRpcProvider, TransactionRequest, Web3Provider,
} from '@ethersproject/providers';
import { chainIdNumber, getNonce, getSignedMetaTransactions } from './walletHelpers';
import { MetaTransaction, RelayerTransactionStatus } from './types';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';
import { retryWithDelay } from '../network/retry';
import { PassportConfiguration } from '../config';
import { RelayerClient } from './relayerClient';
import { UserZkEvm } from '../types';
import GuardianClient, { convertBigNumberishToString } from '../guardian/guardian';

const MAX_TRANSACTION_HASH_RETRIEVAL_RETRIES = 30;
const TRANSACTION_HASH_RETRIEVAL_WAIT = 1000;

export type EthSendTransactionParams = {
  magicProvider: ExternalProvider;
  jsonRpcProvider: JsonRpcProvider;
  guardianClient: GuardianClient;
  config: PassportConfiguration;
  relayerClient: RelayerClient;
  user: UserZkEvm;
  params: Array<any>;
};

export const sendTransaction = async ({
  params,
  magicProvider,
  jsonRpcProvider,
  relayerClient,
  guardianClient,
  config,
  user,
}: EthSendTransactionParams): Promise<string> => {
  const popupWindowSize = { width: 480, height: 580 };
  guardianClient.loading(popupWindowSize);

  const transactionRequest: TransactionRequest = params[0];
  if (!transactionRequest.to) {
    throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, 'eth_sendTransaction requires a "to" field');
  }

  const chainId = chainIdNumber(config.zkEvmChainId);
  const magicWeb3Provider = new Web3Provider(magicProvider);
  const signer = magicWeb3Provider.getSigner();

  const nonce = await getNonce(jsonRpcProvider, user.zkEvm.ethAddress);
  const metaTransaction: MetaTransaction = {
    to: transactionRequest.to,
    data: transactionRequest.data,
    nonce,
    value: transactionRequest.value,
    revertOnError: true,
  };

  // NOTE: We sign the transaction before getting the fee options because
  // accurate estimation of a transaction gas cost is only possible if the smart
  // wallet contract can actually execute it (in a simulated environment) - and
  // it can only execute signed transactions.
  const signedTransaction = await getSignedMetaTransactions(
    [metaTransaction],
    nonce,
    chainId,
    user.zkEvm.ethAddress,
    signer,
  );

  // TODO: ID-698 Add support for non-native gas payments (e.g ERC20, feeTransaction initialisation must change)

  // NOTE: "Fee Options" represent the multiple ways we could pay for the gas
  // used in this transaction. Each fee option has a "recipientAddress" we
  // should transfer the payment to, an amount and a currency. We choose one
  // option and build a transaction that sends the expected currency amount for
  // that option to the specified address.
  const feeOptions = await relayerClient.imGetFeeOptions(user.zkEvm.ethAddress, signedTransaction);
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

  await guardianClient.validateEVMTransaction({
    chainId: config.zkEvmChainId,
    nonce: convertBigNumberishToString(nonce),
    user,
    metaTransactions: [metaTransaction, feeMetaTransaction],
  });

  // NOTE: We sign again because we now are adding the fee transaction, so the
  // whole payload is different and needs a new signature.
  const signedTransactions = await getSignedMetaTransactions(
    [metaTransaction, feeMetaTransaction],
    nonce,
    chainId,
    user.zkEvm.ethAddress,
    signer,
  );

  // TODO: ID-697 Evaluate transactions through Guardian

  const relayerId = await relayerClient.ethSendTransaction(user.zkEvm.ethAddress, signedTransactions);

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

  if (![RelayerTransactionStatus.SUBMITTED, RelayerTransactionStatus.SUCCESSFUL].includes(relayerTransaction.status)) {
    throw new JsonRpcError(
      RpcErrorCode.RPC_SERVER_ERROR,
      `Transaction failed to submit with status ${relayerTransaction.status}`,
    );
  }

  return relayerTransaction.hash;
};
