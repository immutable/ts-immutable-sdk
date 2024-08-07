import {
  WidgetEvent,
  IMTBLWidgetEvents,
  SaleEventType,
  WidgetType,
  SalePaymentTypes, SalePaymentToken,
} from '@imtbl/checkout-sdk';
import { ExecutedTransaction } from './types';

export const sendSaleWidgetCloseEvent = (eventTarget: Window | EventTarget) => {
  const event = new CustomEvent<
  WidgetEvent<WidgetType.SALE, SaleEventType.CLOSE_WIDGET>
  >(IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT, {
    detail: {
      type: SaleEventType.CLOSE_WIDGET,
      data: {},
    },
  });

  // eslint-disable-next-line no-console
  console.log('close widget event:', event);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(event);
};

export const sendSaleSuccessEvent = (
  eventTarget: Window | EventTarget,
  paymentMethod: SalePaymentTypes | undefined,
  transactions: ExecutedTransaction[] = [],
  tokenIds: string[] = [],
  transactionId: string = '',
) => {
  const event = new CustomEvent<
  WidgetEvent<WidgetType.SALE, SaleEventType.SUCCESS>
  >(IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT, {
    detail: {
      type: SaleEventType.SUCCESS,
      data: {
        paymentMethod,
        transactions,
        tokenIds,
        transactionId,
      },
    },
  });
  // eslint-disable-next-line no-console
  console.log('Sale success event:', event);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(event);
};

export const sendSaleFailedEvent = (
  eventTarget: Window | EventTarget,
  reason: string,
  error: Record<string, unknown>,
  paymentMethod: SalePaymentTypes | undefined,
  transactions: ExecutedTransaction[] = [],
  transactionId: string = '',
) => {
  const event = new CustomEvent<
  WidgetEvent<WidgetType.SALE, SaleEventType.FAILURE>
  >(IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT, {
    detail: {
      type: SaleEventType.FAILURE,
      data: {
        reason,
        error,
        paymentMethod,
        transactions,
        transactionId,
        timestamp: new Date().getTime(),
      },
    },
  });
  // eslint-disable-next-line no-console
  console.log('Sale failed event:', event);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(event);
};

export const sendSaleTransactionSuccessEvent = (
  eventTarget: Window | EventTarget,
  paymentMethod: SalePaymentTypes | undefined,
  transactions: ExecutedTransaction[],
) => {
  const event = new CustomEvent<
  WidgetEvent<WidgetType.SALE, SaleEventType.TRANSACTION_SUCCESS>
  >(IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT, {
    detail: {
      type: SaleEventType.TRANSACTION_SUCCESS,
      data: { paymentMethod, transactions },
    },
  });
  // eslint-disable-next-line no-console
  console.log('Sale transaction success event:', event);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(event);
};

export const sendSalePaymentMethodEvent = (
  eventTarget: Window | EventTarget,
  paymentMethod: SalePaymentTypes | undefined,
) => {
  const event = new CustomEvent<
  WidgetEvent<WidgetType.SALE, SaleEventType.PAYMENT_METHOD>
  >(IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT, {
    detail: {
      type: SaleEventType.PAYMENT_METHOD,
      data: { paymentMethod },
    },
  });
  // eslint-disable-next-line no-console
  console.log('Sale payment method event:', event);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(event);
};

export const sendSalePaymentTokenEvent = (
  eventTarget: Window | EventTarget,
  details: SalePaymentToken,
) => {
  const event = new CustomEvent<
  WidgetEvent<WidgetType.SALE, SaleEventType.PAYMENT_TOKEN>
  >(IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT, {
    detail: {
      type: SaleEventType.PAYMENT_TOKEN,
      data: { ...details },
    },
  });
  // eslint-disable-next-line no-console
  console.log('Sale payment token selected event:', event);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(event);
};
