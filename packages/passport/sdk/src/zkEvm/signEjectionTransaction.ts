import { TransactionRequest } from '@ethersproject/providers';
import {
  prepareAndSignEjectionTransaction,
  EjectionTransactionParams,
  EjectionTransactionResponse,
} from './transactionHelpers';

type EthSendTransactionEjectionParams = EjectionTransactionParams & {
  params: Array<any>;
};

export const signEjectionTransaction = async ({
  params,
  ethSigner,
  zkEvmAddress,
  flow,
}: EthSendTransactionEjectionParams): Promise<EjectionTransactionResponse> => {
  const transactionRequest = params[0] as TransactionRequest;
  return await prepareAndSignEjectionTransaction({
    transactionRequest,
    ethSigner,
    zkEvmAddress,
    flow,
  });
};
