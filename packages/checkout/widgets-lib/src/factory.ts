/* eslint-disable max-len */
import {
  Widget, Checkout, ConnectWidgetParams, BridgeWidgetParams, WidgetType, WidgetConfiguration, IWidgetsFactory, CreateWidgetParams,
} from '@imtbl/checkout-sdk';
import { Bridge, Connect } from 'CheckoutWidgets';

export class WidgetsFactory implements IWidgetsFactory {
  private sdk: Checkout;

  private widgetConfig: WidgetConfiguration;

  constructor(sdk: Checkout, widgetConfig: WidgetConfiguration) {
    this.sdk = sdk;
    this.widgetConfig = widgetConfig;
  }

  create<T extends WidgetType>(widgetType: T, params: CreateWidgetParams[T]): Widget {
    switch (widgetType) {
      case 'connect': {
        // validate props here
        const connectParams = params as ConnectWidgetParams;
        const connect = new Connect(this.sdk, this.widgetConfig, connectParams);
        return connect;
      }
      case 'bridge': {
        // validate props here
        const bridgeParams = params as BridgeWidgetParams;
        const bridge = new Bridge(this.sdk, this.widgetConfig, bridgeParams);
        return bridge;
      }
      default:
        throw new Error('widget type not supported');
    }
  }
}
