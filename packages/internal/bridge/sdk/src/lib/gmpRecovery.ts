/* eslint-disable @typescript-eslint/naming-convention */
import {
  GMPError, GMPStatus, GMPStatusResponse, GasPaidInfo,
} from '../types/axelar';

const parseGMPStatus = (response: any): GMPStatus | string => {
  const { error, status } = response;

  if (status === 'error' && error) return GMPStatus.DEST_EXECUTE_ERROR;
  if (status === 'executed') return GMPStatus.DEST_EXECUTED;
  if (status === 'approved') return GMPStatus.DEST_GATEWAY_APPROVED;
  if (status === 'called') return GMPStatus.SRC_GATEWAY_CALLED;
  if (status === 'executing') return GMPStatus.DEST_EXECUTING;

  return status;
};

const parseGMPError = (response: any): GMPError | undefined => {
  if (response.error) {
    return {
      message: response.error.error.message,
      txHash: response.error.error.transactionHash,
      chain: response.error.chain,
    };
  } if (response.is_insufficient_fee) {
    return {
      message: 'Insufficient fee',
      txHash: response.call.transaction.hash,
      chain: response.call.chain,
    };
  }
  return undefined;
};

const execGet = async (base: string, params?: any) => fetch(`${base}?${new URLSearchParams(params).toString()}`, {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
  cache: 'no-store',
})
  .then((res) => res.json())
  .then((res) => res.data);

const fetchGMPTransaction = async (
  axelarGMPApiUrl: string,
  txHash: string,
  txLogIndex?: number | undefined,
) => execGet(axelarGMPApiUrl, {
  method: 'searchGMP',
  txHash,
  txLogIndex,
})
  .then((data) => data.find(
    (gmpTx: any) => gmpTx.id.indexOf(txHash) > -1 || gmpTx.call.transactionHash.indexOf(txHash) > -1,
  ))
  .catch(() => undefined);

export const queryTransactionStatus = async (
  axelarGMPApiUrl: string,
  txHash: string,
  txLogIndex?: number | undefined,
): Promise<GMPStatusResponse> => {
  const txDetails = await fetchGMPTransaction(axelarGMPApiUrl, txHash, txLogIndex);

  if (!txDetails) return { status: GMPStatus.CANNOT_FETCH_STATUS };

  const {
    call, gas_status, gas_paid, executed, express_executed, approved, callback,
  } = txDetails;

  const gasPaidInfo: GasPaidInfo = {
    status: gas_status,
    details: gas_paid,
  };

  // Note: Currently, the GMP API doesn't always return the `total` field in the `time_spent` object
  // This is a temporary fix to ensure that the `total` field is always present
  // TODO: Remove this once the API is fixed
  const timeSpent: Record<string, number> = txDetails.time_spent;
  if (timeSpent) {
    timeSpent.total = timeSpent.total
        || Object.values(timeSpent).reduce(
          (accumulator: number, value: number) => accumulator + value,
          0,
        );
  }

  return {
    status: parseGMPStatus(txDetails),
    error: parseGMPError(txDetails),
    timeSpent,
    gasPaidInfo,
    callTx: call,
    executed,
    expressExecuted: express_executed,
    approved,
    callback,
  };
};
