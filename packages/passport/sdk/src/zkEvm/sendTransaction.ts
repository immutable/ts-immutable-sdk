import {
  ExternalProvider, JsonRpcProvider, JsonRpcSigner, TransactionRequest, Web3Provider,
} from '@ethersproject/providers';
import { BigNumber, BigNumberish } from 'ethers';
import { getEip155ChainId, getNonce, getSignedMetaTransactions } from './walletHelpers';
import { MetaTransaction, RelayerTransactionStatus } from './types';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';
import { retryWithDelay } from '../network/retry';
import { RelayerClient } from './relayerClient';
import GuardianClient, { convertBigNumberishToString } from '../guardian/guardian';

const MAX_TRANSACTION_HASH_RETRIEVAL_RETRIES = 30;
const TRANSACTION_HASH_RETRIEVAL_WAIT = 1000;

export type EthSendTransactionParams = {
  magicProvider: ExternalProvider;
  jsonRpcProvider: JsonRpcProvider;
  guardianClient: GuardianClient;
  relayerClient: RelayerClient;
  zkevmAddress: string,
  params: Array<any>;
};

const getMetaTransactions = async (
  metaTransaction: MetaTransaction,
  nonce: BigNumberish,
  chainId: BigNumber,
  walletAddress: string,
  signer: JsonRpcSigner,
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

export const sendTransaction = ({
  params,
  magicProvider,
  jsonRpcProvider,
  relayerClient,
  guardianClient,
  zkevmAddress,
}: EthSendTransactionParams): Promise<string> => guardianClient
  .withConfirmationScreen({ width: 480, height: 720 })(async () => {
    const transactionRequest: TransactionRequest = params[0];
    if (!transactionRequest.to) {
      throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, 'eth_sendTransaction requires a "to" field');
    }

    const { chainId } = await jsonRpcProvider.ready;
    const chainIdBigNumber = BigNumber.from(chainId);
    const magicWeb3Provider = new Web3Provider(magicProvider);
    const signer = magicWeb3Provider.getSigner();

    const nonce = await getNonce(jsonRpcProvider, zkevmAddress);
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
      signer,
      relayerClient,
    );

    await guardianClient.validateEVMTransaction({
      chainId: getEip155ChainId(chainId),
      nonce: convertBigNumberishToString(nonce),
      metaTransactions,
    });

    // NOTE: We sign again because we now are adding the fee transaction, so the
    // whole payload is different and needs a new signature.
    const signedTransactions = await getSignedMetaTransactions(
      metaTransactions,
      nonce,
      chainIdBigNumber,
      zkevmAddress,
      signer,
    );

    const relayerId = await relayerClient.ethSendTransaction(zkevmAddress, signedTransactions);

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
  });
