import { prepareAndSignTransaction, pollRelayerTransaction, TransactionParams } from './transactionHelpers';
import { personalSign } from './personalSign';

type EthSendDeployTransactionParams = TransactionParams & {
  params: Array<any>;
};

export const sendDeployTransactionAndPersonalSign = async ({
  params,
  ethSigner,
  rpcProvider,
  relayerClient,
  guardianClient,
  zkEvmAddress,
  flow,
}: EthSendDeployTransactionParams): Promise<string> => {
  const deployTransaction = { to: zkEvmAddress, value: 0 };

  const { relayerId } = await prepareAndSignTransaction({
    transactionRequest: deployTransaction,
    ethSigner,
    rpcProvider,
    guardianClient,
    relayerClient,
    zkEvmAddress,
    flow,
  });

  return guardianClient.withConfirmationScreen()(async () => {
    const signedMessage = await personalSign({
      params,
      ethSigner,
      zkEvmAddress,
      rpcProvider,
      guardianClient,
      relayerClient,
      flow,
    });

    await pollRelayerTransaction(relayerClient, relayerId, flow);

    return signedMessage;
  });
};
