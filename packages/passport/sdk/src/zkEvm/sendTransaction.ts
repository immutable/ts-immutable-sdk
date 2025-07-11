import { prepareAndSignTransaction, pollRelayerTransaction, TransactionParams } from './transactionHelpers';

type EthSendTransactionParams = TransactionParams & {
  params: Array<any>;
};

export const sendTransaction = async ({
  params,
  magicTeeAdapter,
  rpcProvider,
  relayerClient,
  guardianClient,
  zkEvmAddresses,
  flow,
  nonceSpace,
  isBackgroundTransaction = false,
}: EthSendTransactionParams): Promise<string> => {
  const transactionRequest = params[0];

  const { relayerId } = await prepareAndSignTransaction({
    transactionRequest,
    magicTeeAdapter,
    rpcProvider,
    guardianClient,
    relayerClient,
    zkEvmAddresses,
    flow,
    nonceSpace,
    isBackgroundTransaction,
  });

  const { hash } = await pollRelayerTransaction(relayerClient, relayerId, flow);
  return hash;
};
