import {
  Checkout,
  IWidgetsFactory,
  IWidgetsFactoryCreate,
  NamedBrowserProvider,
  Widget,
  WidgetConfiguration,
  WidgetConfigurations,
  WidgetProperties,
  WidgetType,
} from '@imtbl/checkout-sdk';
import './i18n';
import { Connect } from './widgets/connect/ConnectWidgetRoot';
import { Swap } from './widgets/swap/SwapWidgetRoot';
import { OnRamp } from './widgets/on-ramp/OnRampWidgetRoot';
import { Wallet } from './widgets/wallet/WalletWidgetRoot';
import { Sale } from './widgets/sale/SaleWidgetRoot';
import { Bridge } from './widgets/bridge/BridgeWidgetRoot';
import { WalletConnectManager } from './lib/walletConnect';
import {
  addProviderListenersForWidgetRoot,
  DEFAULT_THEME,
  sendProviderUpdatedEvent,
} from './lib';
import { AddTokens } from './widgets/add-tokens/AddTokensRoot';
import { CommerceWidgetRoot } from './widgets/immutable-commerce/CommerceWidgetRoot';
import { Purchase } from './widgets/purchase/PurchaseWidgetRoot';

export class WidgetsFactory implements IWidgetsFactory {
  private sdk: Checkout;

  private widgetConfig: WidgetConfiguration;

  constructor(sdk: Checkout, widgetConfig: WidgetConfiguration) {
    this.sdk = sdk;
    this.widgetConfig = widgetConfig;
    if (!this.widgetConfig.theme) this.widgetConfig.theme = DEFAULT_THEME;
    if (widgetConfig.walletConnect) {
      try {
        WalletConnectManager.getInstance().initialise(
          sdk.config.environment,
          widgetConfig.walletConnect,
          this.widgetConfig.theme,
          sdk.config.remote.getConfig('connect') as Promise<any>,
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('WalletConnect has not been set up correctly');
      }
    }
  }

  updateProvider(provider: NamedBrowserProvider) {
    addProviderListenersForWidgetRoot(provider);
    sendProviderUpdatedEvent({ provider });
  }

  create: IWidgetsFactoryCreate = <T extends WidgetType>(type: T, props?: WidgetProperties<T>) => {
    const { provider } = props ?? {};
    const config = props?.config as WidgetConfigurations[WidgetType] || {};

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
      case WidgetType.IMMUTABLE_COMMERCE: {
        return new CommerceWidgetRoot(this.sdk, {
          config: { ...this.widgetConfig, ...(config) },
          provider,
        }) as Widget<WidgetType.IMMUTABLE_COMMERCE> as Widget<T>;
      }
      case WidgetType.ADD_TOKENS: {
        return new AddTokens(this.sdk, {
          config: { ...this.widgetConfig, ...(config) },
          provider,
        }) as Widget<WidgetType.ADD_TOKENS> as Widget<T>;
      }
      case WidgetType.PURCHASE: {
        return new Purchase(this.sdk, {
          config: { ...this.widgetConfig, ...(config) },
          provider,
        }) as Widget<WidgetType.PURCHASE> as Widget<T>;
      }
      default:
        throw new Error('widget type not supported');
    }
  };
}
