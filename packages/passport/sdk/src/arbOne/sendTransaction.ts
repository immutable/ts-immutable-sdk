import { prepareAndSignTransaction, pollRelayerTransaction, TransactionParams } from './transactionHelpers';

type EthSendTransactionParams = TransactionParams & {
  params: Array<any>;
};

/**
 * Send transaction on Arbitrum One using Sequence wallet and relayer
 * Similar flow to zkEVM:
 * 1. User signs with Sequence wallet (EOA signature)
 * 2. Relayer adds its signature (2x2 multisig)
 * 3. Relayer submits on-chain
 * 4. First transaction auto-deploys the smart contract wallet
 */
export const sendTransaction = async ({
  params,
  sequenceSigner,
  rpcProvider,
  relayerClient,
  arbOneAddress,
  flow,
  nonceSpace,
  isBackgroundTransaction = false,
}: EthSendTransactionParams): Promise<string> => {
  const transactionRequest = params[0];

  const { relayerId } = await prepareAndSignTransaction({
    transactionRequest,
    sequenceSigner,
    rpcProvider,
    relayerClient,
    arbOneAddress,
    flow,
    nonceSpace,
    isBackgroundTransaction,
  });

  const { hash } = await pollRelayerTransaction(relayerClient, relayerId, flow);
  return hash;
};

