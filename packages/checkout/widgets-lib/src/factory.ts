import {
  Widget,
  Checkout,
  WidgetType,
  IWidgetsFactory,
  WidgetConfiguration,
  WidgetProperties,
} from '@imtbl/checkout-sdk';
import { Connect } from 'widgets/connect/ConnectWidgetRoot';
import { Swap } from 'widgets/swap/SwapWidgetRoot';
import { OnRamp } from 'widgets/on-ramp/OnRampWidgetRoot';
import { Wallet } from 'widgets/wallet/WalletWidgetRoot';
import { Sale } from 'widgets/sale/SaleWidgetRoot';
import { Web3Provider } from '@ethersproject/providers';
import { Bridge } from 'widgets/bridge/BridgeWidgetRoot';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5';
import { Web3Modal } from 'context/web3modal-context/web3ModalTypes';
import {
  WALLET_CONNECT_METADATA,
  WALLET_CONNECT_PROJECT_ID,
  getWalletConnectChainsByEnvironment,
} from 'lib/walletconnect/web3modal';
import {
  sendProviderUpdatedEvent,
  addProviderListenersForWidgetRoot,
  getL1ChainId,
} from './lib';
import './i18n';

export class WidgetsFactory implements IWidgetsFactory {
  private sdk: Checkout;

  private widgetConfig: WidgetConfiguration;

  private web3Modal: Web3Modal;

  constructor(sdk: Checkout, widgetConfig: WidgetConfiguration) {
    this.sdk = sdk;
    this.widgetConfig = widgetConfig;

    this.web3Modal = createWeb3Modal({
      projectId: WALLET_CONNECT_PROJECT_ID,
      ethersConfig: defaultConfig({
        metadata: WALLET_CONNECT_METADATA,
        defaultChainId: getL1ChainId(sdk.config),
        enableEIP6963: false,
        enableInjected: false,
        enableCoinbase: false,
      }),
      chains: getWalletConnectChainsByEnvironment(sdk.config.environment),
      enableAnalytics: true, // Optional - true by default
      featuredWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // metamask mobile
      ],
      includeWalletIds: ['c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'],
      excludeWalletIds: ['ALL'],
    });
  }

  updateProvider(provider: Web3Provider) {
    addProviderListenersForWidgetRoot(provider);
    sendProviderUpdatedEvent({ provider });
  }

  create<T extends WidgetType>(type: T, props?: WidgetProperties<T>): Widget<T> {
    const { config = {}, provider } = props ?? {};

    switch (type) {
      case WidgetType.CONNECT: {
        return new Connect(
          this.sdk,
          {
            config: { ...this.widgetConfig, ...(config) },
            provider,

          },
          this.web3Modal,
        ) as Widget<WidgetType.CONNECT> as Widget<T>;
      }
      case WidgetType.BRIDGE: {
        return new Bridge(
          this.sdk,
          {
            config: { ...this.widgetConfig, ...(config) },
            provider,
          },
          this.web3Modal,
        ) as Widget<WidgetType.BRIDGE> as Widget<T>;
      }
      case WidgetType.WALLET: {
        return new Wallet(
          this.sdk,
          {
            config: { ...this.widgetConfig, ...(config) },
            provider,
          },
          this.web3Modal,
        ) as Widget<WidgetType.WALLET> as Widget<T>;
      }
      case WidgetType.SWAP: {
        return new Swap(
          this.sdk,
          {
            config: { ...this.widgetConfig, ...(config) },
            provider,
          },
          this.web3Modal,
        ) as Widget<WidgetType.SWAP> as Widget<T>;
      }
      case WidgetType.ONRAMP: {
        return new OnRamp(
          this.sdk,
          {
            config: { ...this.widgetConfig, ...(config) },
            provider,
          },
          this.web3Modal,
        ) as Widget<WidgetType.ONRAMP> as Widget<T>;
      }
      case WidgetType.SALE: {
        return new Sale(
          this.sdk,
          {
            config: { ...this.widgetConfig, ...(config) },
            provider,
          },
          this.web3Modal,
        ) as Widget<WidgetType.SALE> as Widget<T>;
      }
      default:
        throw new Error('widget type not supported');
    }
  }
}
