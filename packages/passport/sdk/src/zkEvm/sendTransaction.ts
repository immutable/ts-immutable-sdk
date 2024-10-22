import { TransactionRequest } from '@ethersproject/providers';
import {
  prepareAndSignTransaction, pollRelayerTransaction, TransactionParams, prepareAndSignEjectionTransaction,
  EjectionTransactionParams,
} from './transactionHelpers';

type EthSendTransactionParams = TransactionParams & {
  params: Array<any>;
};

type EthSendTransactionEjectionParams = EjectionTransactionParams & {
  params: Array<any>;
};

export const sendTransaction = async ({
  params,
  ethSigner,
  rpcProvider,
  relayerClient,
  guardianClient,
  zkEvmAddress,
  flow,
}: EthSendTransactionParams): Promise<string> => {
  const transactionRequest = params[0];

  const { relayerId } = await prepareAndSignTransaction({
    transactionRequest,
    ethSigner,
    rpcProvider,
    guardianClient,
    relayerClient,
    zkEvmAddress,
    flow,
  });

  const { hash } = await pollRelayerTransaction(relayerClient, relayerId, flow);
  return hash;
};

export const signEjectionTransaction = async ({
  params,
  ethSigner,
  zkEvmAddress,
  flow,
}: EthSendTransactionEjectionParams): Promise<string> => {
  const transactionRequest = params[0] as TransactionRequest;
  return await prepareAndSignEjectionTransaction({
    transactionRequest,
    ethSigner,
    zkEvmAddress,
    flow,
  });
};
