import {
  WidgetEvent,
  WidgetType,
  AddTokensEventType,
  IMTBLWidgetEvents,
  EIP6963ProviderInfo,
  WrappedBrowserProvider,
} from '@imtbl/checkout-sdk';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function sendAddTokensCloseEvent(eventTarget: Window | EventTarget) {
  const closeWidgetEvent = new CustomEvent<
  WidgetEvent<WidgetType.ADD_TOKENS, AddTokensEventType.CLOSE_WIDGET>
  >(IMTBLWidgetEvents.IMTBL_ADD_TOKENS_WIDGET_EVENT, {
    detail: {
      type: AddTokensEventType.CLOSE_WIDGET,
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
  WidgetEvent<WidgetType.ADD_TOKENS, AddTokensEventType.CONNECT_SUCCESS>
  >(IMTBLWidgetEvents.IMTBL_ADD_TOKENS_WIDGET_EVENT, {
    detail: {
      type: AddTokensEventType.CONNECT_SUCCESS,
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

export const sendAddTokensSuccessEvent = (eventTarget: Window | EventTarget, transactionHash: string) => {
  const successEvent = new CustomEvent<WidgetEvent<WidgetType.ADD_TOKENS, AddTokensEventType.SUCCESS>>(
    IMTBLWidgetEvents.IMTBL_ADD_TOKENS_WIDGET_EVENT,
    {
      detail: {
        type: AddTokensEventType.SUCCESS,
        data: {
          transactionHash,
        },
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('add tokens success event:', eventTarget, successEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(successEvent);
};

export const sendAddTokensFailedEvent = (eventTarget: Window | EventTarget, reason: string) => {
  const failedEvent = new CustomEvent<WidgetEvent<WidgetType.ADD_TOKENS, AddTokensEventType.FAILURE>>(
    IMTBLWidgetEvents.IMTBL_ADD_TOKENS_WIDGET_EVENT,
    {
      detail: {
        type: AddTokensEventType.FAILURE,
        data: {
          reason,
          timestamp: new Date().getTime(),
        },
      },
    },
  );
  // eslint-disable-next-line no-console
  console.log('add tokens failed event:', eventTarget, failedEvent);
  if (eventTarget !== undefined) eventTarget.dispatchEvent(failedEvent);
};
