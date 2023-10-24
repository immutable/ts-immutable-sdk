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
import { Bridge } from 'widgets/bridge/BridgeWidgetRoot';
import { Connect } from 'widgets/connect/ConnectWidgetRoot';

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
          params,
        }) as Widget<WidgetType.CONNECT> as Widget<T>;
      }
      case WidgetType.BRIDGE: {
        // @ts-ignore
        return new Bridge<WidgetType.BRIDGE>(this.sdk, {
          config: this.widgetConfig,
          params,
        }) as Widget<WidgetType.BRIDGE> as Widget<T>;
      }
      default:
        throw new Error('widget type not supported');
    }
  }
}
