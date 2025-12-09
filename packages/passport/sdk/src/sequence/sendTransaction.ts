import { prepareAndSignTransaction, TransactionParams } from './transactionHelpers';
import { EvmChain } from '../types';

type EthSendTransactionParams = TransactionParams & {
  params: Array<any>;
  chain: EvmChain;
};

export const sendTransaction = async ({
  params,
  sequenceSigner,
  rpcProvider,
  relayerClient,
  guardianClient,
  walletAddress,
  flow,
  authManager,
  chain,
}: EthSendTransactionParams): Promise<string> => {
  const transactionRequest = params[0];

  const { to, data } = await prepareAndSignTransaction({
    transactionRequest,
    sequenceSigner,
    rpcProvider,
    relayerClient,
    guardianClient,
    walletAddress,
    flow,
    authManager,
  });

  const txHash = await relayerClient.postToRelayer(chain, to, data, flow);
  return txHash;
};
