import {
  ExternalProvider, JsonRpcProvider, TransactionRequest, Web3Provider,
} from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { getEip155ChainId, getNonce, getSignedMetaTransactions } from './walletHelpers';
import { MetaTransaction, RelayerTransactionStatus } from './types';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';
import { retryWithDelay } from '../network/retry';
import { RelayerClient } from './relayerClient';
import { UserZkEvm } from '../types';
import GuardianClient, { convertBigNumberishToString } from '../guardian/guardian';

const MAX_TRANSACTION_HASH_RETRIEVAL_RETRIES = 30;
const TRANSACTION_HASH_RETRIEVAL_WAIT = 1000;

export type EthSendTransactionParams = {
  magicProvider: ExternalProvider;
  jsonRpcProvider: JsonRpcProvider;
  guardianClient: GuardianClient;
  relayerClient: RelayerClient;
  user: UserZkEvm;
  params: Array<any>;
};

export const sendTransaction = ({
  params,
  magicProvider,
  jsonRpcProvider,
  relayerClient,
  guardianClient,
  user,
}: EthSendTransactionParams): Promise<string> => guardianClient
  .withConfirmationScreen({ width: 480, height: 520 })(async () => {
    const transactionRequest: TransactionRequest = params[0];
    if (!transactionRequest.to) {
      throw new JsonRpcError(RpcErrorCode.INVALID_PARAMS, 'eth_sendTransaction requires a "to" field');
    }

    const { chainId } = await jsonRpcProvider.ready;
    const chainIdBigNumber = BigNumber.from(chainId);
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

    await guardianClient.validateEVMTransaction({
      chainId: getEip155ChainId(chainId),
      nonce: convertBigNumberishToString(nonce),
      user,
      metaTransactions: [metaTransaction],
    });

    const signedTransactions = await getSignedMetaTransactions(
      [metaTransaction],
      nonce,
      chainIdBigNumber,
      user.zkEvm.ethAddress,
      signer,
    );

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

    if (![
      RelayerTransactionStatus.SUBMITTED,
      RelayerTransactionStatus.SUCCESSFUL,
    ].includes(relayerTransaction.status)) {
      throw new JsonRpcError(
        RpcErrorCode.RPC_SERVER_ERROR,
        `Transaction failed to submit with status ${relayerTransaction.status}`,
      );
    }

    return relayerTransaction.hash;
  });
