export enum TransakEvents {
  TRANSAK_WIDGET_OPEN = 'TRANSAK_WIDGET_OPEN', // transak widget initialised and loaded
  TRANSAK_ORDER_CREATED = 'TRANSAK_ORDER_CREATED', // order created and awaiting payment from payment <= 3DS check happens after this event
  TRANSAK_ORDER_SUCCESSFUL = 'TRANSAK_ORDER_SUCCESSFUL', // order successfully submitted and completed
  TRANSAK_ORDER_FAILED = 'TRANSAK_ORDER_FAILED', // order processing failed
}

export enum TransakStatuses {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
}

export interface TransakEventData {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  event_id: TransakEvents,
  data: {
    id: string;
    status: string;
    statusReason?: string;
    transactionHash?: string; // only available for completed txns
  }
}
