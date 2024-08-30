import { IMTBLWidgetEvents } from '../widgets/definitions/events/widgets';
import { WidgetEventData, WidgetType } from '../widgets/definitions/types';

export enum PostMessageHandlerEventType {
  SYN = 'IMTBL_POST_MESSAGE_SYN',
  ACK = 'IMTBL_POST_MESSAGE_ACK',
  PROVIDER_RELAY = 'IMTBL_PROVIDER_RELAY',
  PROVIDER_UPDATED = 'IMTBL_PROVIDER_UPDATED',
  EIP_6963_EVENT = 'IMTBL_EIP_6963_EVENT',
  WIDGET_EVENT = 'IMTBL_CHECKOUT_WIDGET_EVENT',
}

export type WidgetEventDetail<T extends WidgetType> = {
  [K in keyof WidgetEventData[T]]: {
    type: K;
    data: WidgetEventData[T][K];
  };
}[keyof WidgetEventData[T]];

export type PostMessageProviderRelayData = any;

export type PostMessageEIP6963Data = any;

export type PostMessageWidgetEventData<
  T extends WidgetType = WidgetType.CHECKOUT,
> = {
  type: IMTBLWidgetEvents.IMTBL_CHECKOUT_WIDGET_EVENT;
  detail: WidgetEventDetail<T>;
};

export type PostMessageData =
  | {
    type: PostMessageHandlerEventType.SYN;
    payload: any;
  }
  | {
    type: PostMessageHandlerEventType.ACK;
    payload: any;
  }
  | {
    type: PostMessageHandlerEventType.PROVIDER_RELAY;
    payload: PostMessageProviderRelayData;
  }
  | {
    type: PostMessageHandlerEventType.PROVIDER_UPDATED;
    payload: any;
  }
  | {
    type: PostMessageHandlerEventType.EIP_6963_EVENT;
    payload: PostMessageEIP6963Data;
  }
  | {
    type: PostMessageHandlerEventType.WIDGET_EVENT;
    payload: PostMessageWidgetEventData;
  };
