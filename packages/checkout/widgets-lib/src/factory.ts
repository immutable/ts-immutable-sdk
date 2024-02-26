import {
  Widget,
  Checkout,
  WidgetType,
  IWidgetsFactory,
  WidgetConfiguration,
  WidgetProperties,
  WidgetTheme,
} from '@imtbl/checkout-sdk';
import { Connect } from 'widgets/connect/ConnectWidgetRoot';
import { Swap } from 'widgets/swap/SwapWidgetRoot';
import { OnRamp } from 'widgets/on-ramp/OnRampWidgetRoot';
import { Wallet } from 'widgets/wallet/WalletWidgetRoot';
import { Sale } from 'widgets/sale/SaleWidgetRoot';
import { Web3Provider } from '@ethersproject/providers';
import { Bridge } from 'widgets/bridge/BridgeWidgetRoot';
import { WalletConnectManager } from 'lib/walletConnect';
import {
  sendProviderUpdatedEvent,
  addProviderListenersForWidgetRoot,
} from './lib';
import './i18n';

export class WidgetsFactory implements IWidgetsFactory {
  private sdk: Checkout;

  private widgetConfig: WidgetConfiguration;

  constructor(sdk: Checkout, widgetConfig: WidgetConfiguration) {
    this.sdk = sdk;
    this.widgetConfig = widgetConfig;
    if (!this.widgetConfig.theme) this.widgetConfig.theme = WidgetTheme.DARK;
    if (widgetConfig.walletConnect) {
      try {
        WalletConnectManager.getInstance().initialise(
          sdk.config.environment,
          widgetConfig.walletConnect,
          this.widgetConfig.theme,
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('WalletConnect has not been set up correctly');
      }
    }
  }

  updateProvider(provider: Web3Provider) {
    addProviderListenersForWidgetRoot(provider);
    sendProviderUpdatedEvent({ provider });
  }

  create<T extends WidgetType>(type: T, props?: WidgetProperties<T>): Widget<T> {
    const { config = {}, provider } = props ?? {};

    switch (type) {
      case WidgetType.CONNECT: {
        return new Connect(this.sdk, {
          config: { ...this.widgetConfig, ...(config) },
          provider,
        }) as Widget<WidgetType.CONNECT> as Widget<T>;
      }
      case WidgetType.BRIDGE: {
        return new Bridge(this.sdk, {
          config: { ...this.widgetConfig, ...(config) },
          provider,
        }) as Widget<WidgetType.BRIDGE> as Widget<T>;
      }
      case WidgetType.WALLET: {
        return new Wallet(this.sdk, {
          config: { ...this.widgetConfig, ...(config) },
          provider,
        }) as Widget<WidgetType.WALLET> as Widget<T>;
      }
      case WidgetType.SWAP: {
        return new Swap(this.sdk, {
          config: { ...this.widgetConfig, ...(config) },
          provider,
        }) as Widget<WidgetType.SWAP> as Widget<T>;
      }
      case WidgetType.ONRAMP: {
        return new OnRamp(this.sdk, {
          config: { ...this.widgetConfig, ...(config) },
          provider,
        }) as Widget<WidgetType.ONRAMP> as Widget<T>;
      }
      case WidgetType.SALE: {
        return new Sale(this.sdk, {
          config: { ...this.widgetConfig, ...(config) },
          provider,
        }) as Widget<WidgetType.SALE> as Widget<T>;
      }
      default:
        throw new Error('widget type not supported');
    }
  }
}
