import { prepareAndSignTransaction, pollRelayerTransaction, TransactionParams } from './transactionHelpers';
import { personalSign } from './personalSign';

type EthSendDeployTransactionParams = TransactionParams & {
  params: Array<any>;
};

export const sendDeployTransactionAndPersonalSign = async ({
  params,
  magicTeeAdapter,
  rpcProvider,
  relayerClient,
  guardianClient,
  zkEvmAddresses,
  flow,
}: EthSendDeployTransactionParams): Promise<string> => {
  const deployTransaction = { to: zkEvmAddresses.ethAddress, value: 0 };

  const { relayerId } = await prepareAndSignTransaction({
    transactionRequest: deployTransaction,
    magicTeeAdapter,
    rpcProvider,
    guardianClient,
    relayerClient,
    zkEvmAddresses,
    flow,
  });

  return guardianClient.withConfirmationScreen()(async () => {
    const signedMessage = await personalSign({
      params,
      magicTeeAdapter,
      zkEvmAddresses,
      rpcProvider,
      guardianClient,
      relayerClient,
      flow,
    });

    await pollRelayerTransaction(relayerClient, relayerId, flow);

    return signedMessage;
  });
};
