import { Web3Provider } from '@ethersproject/providers';
import {
  WidgetEvent,
  WidgetType,
  AddFundsEventType,
  IMTBLWidgetEvents,
  EIP6963ProviderInfo,
} from '@imtbl/checkout-sdk';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function sendAddFundsCloseEvent(eventTarget: Window | EventTarget) {
  const closeWidgetEvent = new CustomEvent<
  WidgetEvent<WidgetType.ADD_FUNDS, AddFundsEventType.CLOSE_WIDGET>
  >(IMTBLWidgetEvents.IMTBL_ADD_FUNDS_WIDGET_EVENT, {
    detail: {
      type: AddFundsEventType.CLOSE_WIDGET,
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
  provider: Web3Provider,
  providerInfo: EIP6963ProviderInfo,
) {
  const successEvent = new CustomEvent<
  WidgetEvent<WidgetType.ADD_FUNDS, AddFundsEventType.CONNECT_SUCCESS>
  >(IMTBLWidgetEvents.IMTBL_ADD_FUNDS_WIDGET_EVENT, {
    detail: {
      type: AddFundsEventType.CONNECT_SUCCESS,
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
