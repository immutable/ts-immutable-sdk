import { SequenceRelayerClient } from './sequenceRelayerClient';
import { prepareAndSignTransaction, SequenceTransactionParams } from './transactionHelpers';

type EthSendTransactionParams = SequenceTransactionParams & {
  params: Array<any>;
};

export const sendTransaction = async ({
  params,
  sequenceSigner,
  oxRpcProvider,
  guardianClient,
  relayerClient,
  auth,
  walletAddress,
  flow,
  nonceSpace,
  isBackgroundTransaction = false,
}: EthSendTransactionParams & { relayerClient: SequenceRelayerClient }): Promise<string> => {
  const transactionRequest = params[0];

  const { to, data } = await prepareAndSignTransaction({
    transactionRequest,
    sequenceSigner,
    oxRpcProvider,
    guardianClient,
    walletAddress,
    flow,
    auth,
    nonceSpace,
    isBackgroundTransaction,
  });

  const txHash = await relayerClient.postToRelayer(to, data, flow);
  return txHash;
};
