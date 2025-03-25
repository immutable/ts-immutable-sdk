import {
  WidgetEvent,
  TransferEventType,
  IMTBLWidgetEvents,
  WidgetType,
} from '@imtbl/checkout-sdk';

export const sendSuccessEvent = (eventTarget: Window | EventTarget, transactionHash: string) => {
  const successEvent = new CustomEvent<WidgetEvent<WidgetType.TRANSFER, TransferEventType.SUCCESS>>(
    IMTBLWidgetEvents.IMTBL_TRANSFER_WIDGET_EVENT,
    {
      detail: {
        type: TransferEventType.SUCCESS,
        data: {
          transactionHash,
        },
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('transfer success event:', eventTarget, successEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(successEvent);
};

export const sendFailedEvent = (eventTarget: Window | EventTarget, reason: string) => {
  const failedEvent = new CustomEvent<WidgetEvent<WidgetType.TRANSFER, TransferEventType.FAILURE>>(
    IMTBLWidgetEvents.IMTBL_TRANSFER_WIDGET_EVENT,
    {
      detail: {
        type: TransferEventType.FAILURE,
        data: {
          reason,
          timestamp: new Date().getTime(),
        },
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('transfer failed event:', eventTarget, failedEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(failedEvent);
};

export const sendRejectedEvent = (eventTarget: Window | EventTarget, reason: string) => {
  const rejectedEvent = new CustomEvent<WidgetEvent<WidgetType.TRANSFER, TransferEventType.REJECTED>>(
    IMTBLWidgetEvents.IMTBL_TRANSFER_WIDGET_EVENT,
    {
      detail: {
        type: TransferEventType.REJECTED,
        data: {
          reason,
          timestamp: new Date().getTime(),
        },
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('transfer rejected event:', eventTarget, rejectedEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(rejectedEvent);
};
