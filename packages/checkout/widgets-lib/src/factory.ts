/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import {
  Widget,
  Checkout,
  WidgetType,
  WidgetConfiguration,
  IWidgetsFactory,
  WidgetParameters,
} from '@imtbl/checkout-sdk';
import { Bridge } from 'widgets/bridge/BridgeWidgetRoot';
import { Connect } from 'widgets/connect/ConnectWidgetRoot';
import { OnRamp } from 'widgets/on-ramp/OnRampWidgetRoot';
import { Wallet } from 'widgets/wallet/WalletWidgetRoot';

export class WidgetsFactory implements IWidgetsFactory {
  private sdk: Checkout;

  private widgetConfig: WidgetConfiguration;

  constructor(sdk: Checkout, widgetConfig: WidgetConfiguration) {
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
        return new Bridge(this.sdk, {
          config: this.widgetConfig,
          params,
        }) as Widget<WidgetType.BRIDGE> as Widget<T>;
      }
      case WidgetType.WALLET: {
        return new Wallet(this.sdk, {
          config: this.widgetConfig,
          params,
        }) as Widget<WidgetType.WALLET> as Widget<T>;
      }
      case WidgetType.ONRAMP: {
        return new OnRamp(this.sdk, {
          config: this.widgetConfig,
          params,
        }) as Widget<WidgetType.ONRAMP> as Widget<T>;
      }
      default:
        throw new Error('widget type not supported');
    }
  }
}
