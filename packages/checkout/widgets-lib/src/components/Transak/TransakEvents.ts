/* eslint-disable @typescript-eslint/naming-convention */
export enum TransakEvents {
  /**
   * transak widget initialised and loaded
   */
  TRANSAK_WIDGET_OPEN = 'TRANSAK_WIDGET_OPEN',
  /**
   * order created and awaiting payment from payment
   */
  TRANSAK_ORDER_CREATED = 'TRANSAK_ORDER_CREATED',
  /**
   * order successfully submitted or completed
   */
  TRANSAK_ORDER_SUCCESSFUL = 'TRANSAK_ORDER_SUCCESSFUL',
  /**
   * order processing failed
   */
  TRANSAK_ORDER_FAILED = 'TRANSAK_ORDER_FAILED',
}

export enum TransakStatuses {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
}

type TransakEventData = {
  id: string;
  status: string | TransakStatuses;
  statusReason?: string;
};

export type TransakEvent =
  | {
    event_id: Omit<TransakEvents, TransakEvents.TRANSAK_ORDER_SUCCESSFUL>;
    data: TransakEventData;
  }
  | {
    event_id: TransakEvents.TRANSAK_ORDER_SUCCESSFUL;
    data: TransakEventData & {
      status: TransakStatuses.COMPLETED;
      transactionHash: string;
    };
  };
