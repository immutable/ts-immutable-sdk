/* eslint-disable @typescript-eslint/naming-convention */
export type TenderlySimulation = {
  from: string;
  to: string;
  data?: string;
  value?: string;
};

export type TenderlyResult = {
  gas: Array<number>;
  delayWithdrawalLargeAmount: boolean;
  delayWithdrawalUnknownToken: boolean;
  withdrawalQueueActivated: boolean;
  largeTransferThresholds: number;
};
