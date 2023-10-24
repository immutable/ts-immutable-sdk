/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import {
  Widget,
  Checkout,
  ConnectWidgetParams,
  BridgeWidgetParams,
  WidgetType,
  WidgetConfigurations,
  IWidgetsFactory,
  WidgetParameters,
} from '@imtbl/checkout-sdk';
import { Connect } from 'widgets/Connect';

export class WidgetsFactory implements IWidgetsFactory {
  private sdk: Checkout;

  private widgetConfig: WidgetConfigurations;

  constructor(sdk: Checkout, widgetConfig: WidgetConfigurations) {
    this.sdk = sdk;
    this.widgetConfig = widgetConfig;
  }

  create<T extends WidgetType>(type: T, params: WidgetParameters[T]): Widget<T> {
    switch (type) {
      case WidgetType.CONNECT: {
        return new Connect(this.sdk, {
          config: this.widgetConfig,
          params: params as ConnectWidgetParams,
        });
      }
      // case WidgetType.BRIDGE: {
      //   // validate props here
      //   const bridgeParams = params as BridgeWidgetParams;
      //   const bridge = new Bridge(this.sdk, this.widgetConfig, bridgeParams);
      //   return bridge;
      // }
      default:
        throw new Error('widget type not supported');
    }
  }
}
