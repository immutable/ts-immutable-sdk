import {
  WidgetEvent,
  IMTBLWidgetEvents,
  SaleEventType,
  SaleSuccess,
  SaleFailed,
  SaleTransactionSuccess,
} from '@imtbl/checkout-widgets';
import { ExecutedTransaction } from './types';

export const sendSaleWidgetCloseEvent = (
  eventTarget: Window | EventTarget,
) => {
  const event = new CustomEvent<WidgetEvent<any>>(
    IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT,
    {
      detail: {
        type: SaleEventType.CLOSE_WIDGET,
        data: {},
      },
    },
  );

  // eslint-disable-next-line no-console
  console.log('close widget event:', event);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(event);
};

export const sendSaleSuccessEvent = (
  eventTarget: Window | EventTarget,
  transactions: ExecutedTransaction[] = [],
) => {
  const event = new CustomEvent<WidgetEvent<SaleSuccess>>(
    IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT,
    {
      detail: {
        type: SaleEventType.SUCCESS,
        data: {
          transactions,
        },
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('Sale success event:', event);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(event);
};

export const sendSaleFailedEvent = (
  eventTarget: Window | EventTarget,
  reason: string,
  transactions: ExecutedTransaction[] = [],
) => {
  const event = new CustomEvent<WidgetEvent<SaleFailed>>(
    IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT,
    {
      detail: {
        type: SaleEventType.FAILURE,
        data: {
          reason,
          timestamp: new Date().getTime(),
          transactions,
        },
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('Sale failed event:', event);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(event);
};

export const sendSaleTransactionSuccessEvent = (
  eventTarget: Window | EventTarget,
  transactions: ExecutedTransaction[],
) => {
  const event = new CustomEvent<WidgetEvent<SaleTransactionSuccess>>(
    IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT,
    {
      detail: {
        type: SaleEventType.TRANSACTION_SUCCESS,
        data: { transactions },
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('Sale transaction success event:', event);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(event);
};
