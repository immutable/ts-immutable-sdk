import {
  WidgetEvent,
  WidgetType,
  PurchaseEventType,
  IMTBLWidgetEvents,
  EIP6963ProviderInfo,
  WrappedBrowserProvider,
} from '@imtbl/checkout-sdk';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function sendPurchaseCloseEvent(eventTarget: Window | EventTarget) {
  const closeWidgetEvent = new CustomEvent<
  WidgetEvent<WidgetType.PURCHASE, PurchaseEventType.CLOSE_WIDGET>
  >(IMTBLWidgetEvents.IMTBL_PURCHASE_WIDGET_EVENT, {
    detail: {
      type: PurchaseEventType.CLOSE_WIDGET,
      data: {},
    },
  });
  // TODO: please remove or if necessary keep the eslint ignore
  // eslint-disable-next-line no-console
  console.log('close widget event:', closeWidgetEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(closeWidgetEvent);
}

export function sendConnectProviderSuccessEvent(
  eventTarget: Window | EventTarget,
  providerType: 'from' | 'to',
  provider: WrappedBrowserProvider,
  providerInfo: EIP6963ProviderInfo,
) {
  const successEvent = new CustomEvent<
  WidgetEvent<WidgetType.PURCHASE, PurchaseEventType.CONNECT_SUCCESS>
  >(IMTBLWidgetEvents.IMTBL_PURCHASE_WIDGET_EVENT, {
    detail: {
      type: PurchaseEventType.CONNECT_SUCCESS,
      data: {
        provider,
        providerType,
        providerInfo,
      },
    },
  });
  // eslint-disable-next-line no-console
  console.log(
    `connect ${providerType}Provider success event:`,
    eventTarget,
    successEvent,
  );
  if (eventTarget !== undefined) eventTarget.dispatchEvent(successEvent);
}

export const sendPurchaseSuccessEvent = (eventTarget: Window | EventTarget, transactionHash: string) => {
  const successEvent = new CustomEvent<WidgetEvent<WidgetType.PURCHASE, PurchaseEventType.SUCCESS>>(
    IMTBLWidgetEvents.IMTBL_PURCHASE_WIDGET_EVENT,
    {
      detail: {
        type: PurchaseEventType.SUCCESS,
        data: {
          transactionHash,
        },
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('purchase success event:', eventTarget, successEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(successEvent);
};

export const sendPurchaseFailedEvent = (eventTarget: Window | EventTarget, reason: string) => {
  const failedEvent = new CustomEvent<WidgetEvent<WidgetType.PURCHASE, PurchaseEventType.FAILURE>>(
    IMTBLWidgetEvents.IMTBL_PURCHASE_WIDGET_EVENT,
    {
      detail: {
        type: PurchaseEventType.FAILURE,
        data: {
          reason,
          timestamp: new Date().getTime(),
        },
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('purchase failed event:', eventTarget, failedEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(failedEvent);
};
