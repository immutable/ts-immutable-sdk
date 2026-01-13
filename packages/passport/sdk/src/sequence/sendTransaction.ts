import { prepareAndSignTransaction, TransactionParams } from './transactionHelpers';
import { EvmChain } from '../types';
import { Environment } from '@imtbl/config';

type EthSendTransactionParams = TransactionParams & {
  params: Array<any>;
  chain: EvmChain;
  environment: Environment;
};

export const sendTransaction = async ({
  params,
  sequenceSigner,
  oxRpcProvider,
  relayerClient,
  guardianClient,
  walletAddress,
  flow,
  authManager,
  chain,
  environment,
}: EthSendTransactionParams): Promise<string> => {
  const transactionRequest = params[0];

  const { to, data } = await prepareAndSignTransaction({
    transactionRequest,
    sequenceSigner,
    oxRpcProvider,
    relayerClient,
    guardianClient,
    walletAddress,
    flow,
    authManager,
  });

  const txHash = await relayerClient.postToRelayer(chain, environment, to, data, flow);
  return txHash;
};
