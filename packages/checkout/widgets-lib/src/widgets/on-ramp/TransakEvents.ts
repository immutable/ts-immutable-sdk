export enum TransakEvents {
  TRANSAK_WIDGET_OPEN = 'TRANSAK_WIDGET_OPEN', // transak widget initialised and loaded
  TRANSAK_ORDER_CREATED = 'TRANSAK_ORDER_CREATED', // order created and awaiting payment from payment
  TRANSAK_ORDER_SUCCESSFUL = 'TRANSAK_ORDER_SUCCESSFUL', // order successfully submitted and completed
  TRANSAK_ORDER_FAILED = 'TRANSAK_ORDER_FAILED', // order processing failed
}
