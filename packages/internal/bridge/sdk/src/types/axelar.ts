export enum GMPStatus {
  SRC_GATEWAY_CALLED = 'source_gateway_called',
  DEST_GATEWAY_APPROVED = 'destination_gateway_approved',
  DEST_EXECUTED = 'destination_executed',
  EXPRESS_EXECUTED = 'express_executed',
  DEST_EXECUTE_ERROR = 'error',
  DEST_EXECUTING = 'executing',
  APPROVING = 'approving',
  FORECALLED = 'forecalled',
  FORECALLED_WITHOUT_GAS_PAID = 'forecalled_without_gas_paid',
  NOT_EXECUTED = 'not_executed',
  NOT_EXECUTED_WITHOUT_GAS_PAID = 'not_executed_without_gas_paid',
  INSUFFICIENT_FEE = 'insufficient_fee',
  UNKNOWN_ERROR = 'unknown_error',
  CANNOT_FETCH_STATUS = 'cannot_fetch_status',
  SRC_GATEWAY_CONFIRMED = 'confirmed',
}

export enum GasPaidStatus {
  GAS_UNPAID = 'gas_unpaid',
  GAS_PAID = 'gas_paid',
  GAS_PAID_NOT_ENOUGH_GAS = 'gas_paid_not_enough_gas',
  GAS_PAID_ENOUGH_GAS = 'gas_paid_enough_gas',
}
export interface GasPaidInfo {
  status: GasPaidStatus;
  details?: any;
}
export interface GMPStatusResponse {
  status: GMPStatus | string;
  timeSpent?: Record<string, number>;
  gasPaidInfo?: GasPaidInfo;
  error?: GMPError;
  callTx?: any;
  executed?: any;
  expressExecuted?: any;
  approved?: any;
  callback?: any;
}

export interface GMPError {
  txHash: string;
  chain: string;
  message: string;
}
