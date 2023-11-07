/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import {
  Widget,
  Checkout,
  WidgetType,
  IWidgetsFactory,
  WidgetConfigurations,
  WidgetConfiguration,
} from '@imtbl/checkout-sdk';
import { Bridge } from 'widgets/bridge/BridgeWidgetRoot';
import { Connect } from 'widgets/connect/ConnectWidgetRoot';
import { Swap } from 'widgets/swap/SwapWidgetRoot';
import { OnRamp } from 'widgets/on-ramp/OnRampWidgetRoot';
import { Wallet } from 'widgets/wallet/WalletWidgetRoot';
import { Sale } from 'widgets/sale/SaleWidgetRoot';
import { Web3Provider } from '@ethersproject/providers';
import { sendProviderUpdatedEvent } from './lib';

export class WidgetsFactory implements IWidgetsFactory {
  private sdk: Checkout;

  private widgetConfig: WidgetConfiguration;

  constructor(sdk: Checkout, widgetConfig: WidgetConfiguration) {
    this.sdk = sdk;
    this.widgetConfig = widgetConfig;
  }

  updateProvider(provider: Web3Provider) {
    sendProviderUpdatedEvent({ provider });
  }

  create<T extends WidgetType>(type: T, config: WidgetConfigurations[T], provider?: Web3Provider): Widget<T> {
    switch (type) {
      case WidgetType.CONNECT: {
        return new Connect(this.sdk, {
          config: { ...this.widgetConfig, ...config },
          provider,
        }) as Widget<WidgetType.CONNECT> as Widget<T>;
      }
      case WidgetType.BRIDGE: {
        return new Bridge(this.sdk, {
          config: { ...this.widgetConfig, ...config },
          provider,
        }) as Widget<WidgetType.BRIDGE> as Widget<T>;
      }
      case WidgetType.WALLET: {
        return new Wallet(this.sdk, {
          config: { ...this.widgetConfig, ...config },
          provider,
        }) as Widget<WidgetType.WALLET> as Widget<T>;
      }
      case WidgetType.SWAP: {
        return new Swap(this.sdk, {
          config: { ...this.widgetConfig, ...config },
          provider,
        }) as Widget<WidgetType.SWAP> as Widget<T>;
      }
      case WidgetType.ONRAMP: {
        return new OnRamp(this.sdk, {
          config: { ...this.widgetConfig, ...config },
          provider,
        }) as Widget<WidgetType.ONRAMP> as Widget<T>;
      }
      case WidgetType.SALE: {
        return new Sale(this.sdk, {
          config: { ...this.widgetConfig, ...config },
          provider,
        }) as Widget<WidgetType.SALE> as Widget<T>;
      }
      default:
        throw new Error('widget type not supported');
    }
  }
}
