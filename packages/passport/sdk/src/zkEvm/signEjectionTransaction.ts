import { TransactionRequest } from 'ethers';
import {
  prepareAndSignEjectionTransaction,
  EjectionTransactionParams,
  EjectionTransactionResponse,
} from './transactionHelpers';
import { JsonRpcError, RpcErrorCode } from './JsonRpcError';

type EthSendTransactionEjectionParams = EjectionTransactionParams & {
  params: Array<any>;
};

export const signEjectionTransaction = async ({
  params,
  ethSigner,
  zkEvmAddress,
  flow,
}: EthSendTransactionEjectionParams): Promise<EjectionTransactionResponse> => {
  if (!params || params.length !== 1) {
    throw new JsonRpcError(
      RpcErrorCode.INVALID_PARAMS,
      'im_signEjectionTransaction requires a singular param (hash)',
    );
  }

  const transactionRequest = params[0] as TransactionRequest;
  return await prepareAndSignEjectionTransaction({
    transactionRequest,
    ethSigner,
    zkEvmAddress,
    flow,
  });
};
