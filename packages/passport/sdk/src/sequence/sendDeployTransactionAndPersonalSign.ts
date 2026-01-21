import { Provider } from 'ox';
import { prepareAndSignTransaction, TransactionParams } from './transactionHelpers';
import { personalSign } from './personalSign';
import { SequenceRelayerClient } from './sequenceRelayerClient';
import { EvmChain } from '../types';
import { Environment } from '@imtbl/config';

type SendDeployTransactionAndPersonalSignParams = TransactionParams & {
  params: Array<any>;
  chain: EvmChain;
  environment: Environment;
};

export const sendDeployTransactionAndPersonalSign = async ({
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
}: SendDeployTransactionAndPersonalSignParams): Promise<string> => {
  // const deployTransaction = { to: walletAddress, value: 0 };
  // Use zero address as target for deploy transaction to avoid "self-call" restriction from Sequence
  const deployTransaction = { to: '0x0000000000000000000000000000000000000001', value: 0, data: '0x' };

  const { to, data } = await prepareAndSignTransaction({
    transactionRequest: deployTransaction,
    sequenceSigner,
    oxRpcProvider,
    guardianClient,
    relayerClient,
    walletAddress,
    flow,
    authManager,
  });

  return guardianClient.withConfirmationScreen()(async () => {
    const signedMessage = await personalSign({
      params,
      sequenceSigner,
      walletAddress,
      oxRpcProvider,
      guardianClient,
      flow,
    });

    // Submit deploy transaction to relayer
    await relayerClient.postToRelayer(chain, environment, to, data, flow);

    return signedMessage;
  });
};
