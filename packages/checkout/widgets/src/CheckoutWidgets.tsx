/* eslint-disable class-methods-use-this */
// import { CheckoutWidgetsConfig, SemanticVersion } from './definitions/config';
// import { globalPackageVersion, isDevMode } from './lib/env';

import { Root, createRoot } from 'react-dom/client';
import { Environment } from '@imtbl/config';
import React from 'react';
import { ConnectWidget } from './widgets/widgets/connect/ConnectWidget';
import { WidgetTheme } from './definitions/types';
import { CustomAnalyticsProvider } from './widgets/context/analytics-provider/CustomAnalyticsProvider';
import { StrongCheckoutWidgetsConfig, withDefaultWidgetConfigs } from './widgets/lib/withDefaultWidgetConfig';
import { CheckoutWidgetsConfig } from './definitions/config';
import { ConnectLoader, ConnectLoaderParams } from './widgets/components/ConnectLoader/ConnectLoader';
import { BridgeWidget } from './widgets/widgets/bridge/BridgeWidget';
import { ConnectTargetLayer } from './widgets/lib';
import { sendBridgeWidgetCloseEvent } from './widgets/widgets/bridge/BridgeWidgetEvents';

// /**
//  * Validates and builds a version string based on the given SemanticVersion object.
//  * If the version is undefined or has an invalid major version, it returns the default checkout version.
//  * If the version is all zeros, it also returns the default checkout version.
//  * Otherwise, it constructs a validated version string based on the major, minor, patch, and build numbers.
//  */
// export function validateAndBuildVersion(
//   version: SemanticVersion | undefined,
// ): string {
//   const defaultPackageVersion = globalPackageVersion();

//   if (version === undefined || version.major === undefined) return defaultPackageVersion;

//   if (!Number.isInteger(version.major) || version.major < 0) return defaultPackageVersion;
//   if (version.minor !== undefined && version.minor < 0) return defaultPackageVersion;
//   if (version.patch !== undefined && version.patch < 0) return defaultPackageVersion;

//   if (version.major === 0 && version.minor === undefined) return defaultPackageVersion;
//   if (version.major === 0 && version.minor === 0 && version.patch === undefined) return defaultPackageVersion;
//   if (version.major === 0 && version.minor === undefined && version.patch === undefined) return defaultPackageVersion;
//   if (version.major === 0 && version.minor === 0 && version.patch === 0) return defaultPackageVersion;

//   let validatedVersion: string = version.major.toString();

//   if (version.minor === undefined) return validatedVersion;

//   if (Number.isInteger(version.minor)) {
//     validatedVersion += `.${version.minor.toString()}`;
//   }

//   if (version.patch === undefined) return validatedVersion;

//   if (Number.isInteger(version.patch)) {
//     validatedVersion += `.${version.patch.toString()}`;
//   }

//   if (version.prerelease === undefined || version.prerelease !== 'alpha') return validatedVersion;

//   if (version.prerelease === 'alpha') {
//     validatedVersion += `-${version.prerelease}`;
//   }

//   if (version.build === undefined) return validatedVersion;

//   if (Number.isInteger(version.build) && version.build >= 0) {
//     validatedVersion += `.${version.build.toString()}`;
//   }

//   return validatedVersion;
// }

// /**
//  * Creates and appends a checkout widget script to the document head.
//  * @param {CheckoutWidgetsConfig} [config] - The configuration object for the checkout widget.
//  * @returns None
//  */
// export function CheckoutWidgets(config?: CheckoutWidgetsConfig) {
//   if (window === undefined) {
//     // eslint-disable-next-line no-console
//     console.error('missing window object: please run Checkout client side');
//     return;
//   }
//   if (document === undefined) {
//     // eslint-disable-next-line no-console
//     console.error('missing document object: please run Checkout client side');
//     return;
//   }

//   const checkoutWidgetJS = document.createElement('script');

//   const validVersion = validateAndBuildVersion(config?.version);

//   let cdnUrl = `https://cdn.jsdelivr.net/npm/@imtbl/sdk@${validVersion}/dist/browser/checkout.js`;
//   if (isDevMode()) cdnUrl = 'http://localhost:3000/lib/js/imtbl-checkout.js';

//   checkoutWidgetJS.setAttribute('src', cdnUrl);

//   document.head.appendChild(checkoutWidgetJS);
//   window.ImtblCheckoutWidgetConfig = JSON.stringify(config);
// }

// /**
//  * Updates the configuration for the checkout widgets by setting the global variable
//  * `window.ImtblCheckoutWidgetConfig` to the JSON string representation of the given
//  * `config` object.
//  * @param {CheckoutWidgetsConfig} config - The new configuration object for the checkout widgets.
//  * @returns None
//  */
// export function UpdateConfig(config: CheckoutWidgetsConfig) {
//   if (window === undefined) {
//     // eslint-disable-next-line no-console
//     console.error('missing document object: please run Checkout client side');
//     return;
//   }

//   window.ImtblCheckoutWidgetConfig = JSON.stringify(config);
// }

class Connect {
  connectTargetId?: string;

  connectRoot?: Root;

  connectParams: any;

  connectConfig?: StrongCheckoutWidgetsConfig;

  constructor(config: CheckoutWidgetsConfig) {
    this.connectConfig = withDefaultWidgetConfigs(config);

    window.addEventListener('imtbl-connect-widget', (event: any) => {
      switch (event.detail.type) {
        case 'close-widget': {
          this.unmount();
          break;
        }
        default:
      }
    });
  }

  private renderConnectWidget() {
    if (this.connectRoot) {
      this.connectRoot.render(
        <React.StrictMode>
          <CustomAnalyticsProvider
            widgetConfig={this.connectConfig!}
          >
            <ConnectWidget
              config={this.connectConfig!}
              params={this.connectParams}
            />
          </CustomAnalyticsProvider>
        </React.StrictMode>,
      );
    }
  }

  // eslint-disable-next-line class-methods-use-this
  mount(id: string, params: any) {
    const widgetConfig: StrongCheckoutWidgetsConfig = {
      theme: WidgetTheme.DARK,
      environment: Environment.SANDBOX,
      isBridgeEnabled: true,
      isSwapEnabled: true,
      isOnRampEnabled: true,
    };
    this.connectConfig = widgetConfig;

    this.connectTargetId = id;
    const targetElement = document.getElementById(id);

    const childElement = document.createElement('div');
    childElement.setAttribute('id', 'imtbl-connect');

    if (targetElement?.children.length === 0) {
      // Find the best way to mount the widget etc
      targetElement?.appendChild(childElement);
    } else {
      targetElement?.replaceChildren(childElement);
    }

    let reactRoot;
    if (targetElement && childElement) {
      reactRoot = createRoot(childElement);
      this.connectRoot = reactRoot;
    }

    this.connectParams = params;

    this.renderConnectWidget();
  }

  update(params: any) {
    this.connectParams = params;
    this.renderConnectWidget();
  }

  // config: CheckoutWidgetsConfig
  updateConfig(config: CheckoutWidgetsConfig) {
    this.connectConfig = withDefaultWidgetConfigs({ ...this.connectConfig, ...config });
    console.log('new config', this.connectConfig);
    this.renderConnectWidget();
  }

  show() {
    document.getElementById('imtbl-connect')!.setAttribute('style', 'display: block');
  }

  hide() {
    document.getElementById('imtbl-connect')!.setAttribute('style', 'display: none');
  }

  unmount() {
    this.connectRoot?.unmount();
    document.getElementById(this.connectTargetId as string)?.replaceChildren();
    this.connectRoot = undefined;
  }
}

class Bridge {
  bridgeTargetId?: string;

  bridgeRoot?: Root;

  bridgeParams: any;

  bridgeConfig?: StrongCheckoutWidgetsConfig;

  constructor(config: CheckoutWidgetsConfig) {
    this.bridgeConfig = withDefaultWidgetConfigs(config);
    window.addEventListener('imtbl-bridge-widget', (event: any) => {
      switch (event.detail.type) {
        case 'close-widget': {
          this.unmount();
          break;
        }
        default:
      }
    });
  }

  private renderBridgeWidget() {
    const connectLoaderParams: ConnectLoaderParams = {
      targetLayer: ConnectTargetLayer.LAYER1,
      walletProvider: this.bridgeParams.walletProvider,
      web3Provider: this.bridgeParams.provider,
      passport: this.bridgeParams.passport,
      allowedChains: [
        11155111,
      ],
    };
    console.log('inside render, bridge params', this.bridgeParams);
    if (this.bridgeRoot) {
      this.bridgeRoot.render(
        <React.StrictMode>
          <CustomAnalyticsProvider
            widgetConfig={this.bridgeConfig!}
          >
            <ConnectLoader
              params={connectLoaderParams}
              closeEvent={() => sendBridgeWidgetCloseEvent(window)}
              widgetConfig={this.bridgeConfig!}
            >
              <BridgeWidget
                params={this.bridgeParams}
                config={this.bridgeConfig!}
              />
            </ConnectLoader>
          </CustomAnalyticsProvider>
        </React.StrictMode>,
      );
    }
  }

  // eslint-disable-next-line class-methods-use-this
  mount(id: string, params: any) {
    const widgetConfig: StrongCheckoutWidgetsConfig = {
      theme: WidgetTheme.DARK,
      environment: Environment.SANDBOX,
      isBridgeEnabled: true,
      isSwapEnabled: true,
      isOnRampEnabled: true,
    };
    this.bridgeConfig = widgetConfig;

    this.bridgeTargetId = id;
    const targetElement = document.getElementById(id);

    const childElement = document.createElement('div');
    childElement.setAttribute('id', 'imtbl-bridge');

    if (targetElement?.children.length === 0) {
      // Find the best way to mount the widget etc
      targetElement?.appendChild(childElement);
    } else {
      targetElement?.replaceChildren(childElement);
    }

    let reactRoot;
    if (targetElement && childElement) {
      reactRoot = createRoot(childElement);
      this.bridgeRoot = reactRoot;
    }

    this.bridgeParams = params;

    this.renderBridgeWidget();
  }

  update(params: any) {
    this.bridgeParams = params;
    console.log(params);
    console.log(this.bridgeParams);
    this.renderBridgeWidget();
  }

  // config: CheckoutWidgetsConfig
  updateConfig(config: CheckoutWidgetsConfig) {
    this.bridgeConfig = withDefaultWidgetConfigs({ ...this.bridgeConfig, ...config });
    console.log('new config', this.bridgeConfig);
    this.renderBridgeWidget();
  }

  show() {
    document.getElementById('imtbl-bridge')!.setAttribute('style', 'display: block');
  }

  hide() {
    document.getElementById('imtbl-bridge')!.setAttribute('style', 'display: none');
  }

  unmount() {
    this.bridgeRoot?.unmount();
    document.getElementById(this.bridgeTargetId as string)?.replaceChildren();
    this.bridgeRoot = undefined;
  }
}

export class Widgets {
  allWidgetsConfig: CheckoutWidgetsConfig;

  connect: Connect;

  bridge: Bridge;

  constructor(config: CheckoutWidgetsConfig) {
    this.allWidgetsConfig = config;
    this.connect = new Connect(config);
    this.bridge = new Bridge(config);
  }

  updateConfig(config: CheckoutWidgetsConfig) {
    this.connect.updateConfig(config);
    this.bridge.updateConfig(config);
  }
}
