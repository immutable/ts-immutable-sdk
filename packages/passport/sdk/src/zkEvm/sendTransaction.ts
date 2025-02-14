import { prepareAndSignTransaction, pollRelayerTransaction, TransactionParams } from './transactionHelpers';

type EthSendTransactionParams = TransactionParams & {
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
  nonceSpace,
  transactionName,
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
    nonceSpace,
    transactionName,
  });

  const { hash } = await pollRelayerTransaction(relayerClient, relayerId, flow);
  return hash;
};
