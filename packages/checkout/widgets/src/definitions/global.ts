/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';

/**
 * Declares global interfaces and namespaces for the application.
 * @global
 * @namespace
 * @interface Window
 * @property {any} ImtblCheckoutWidgetConfig - Configuration object for the ImtblCheckoutWidget.
 *
 * @namespace JSX
 * @interface IntrinsicElements
 * @property {ImtblConnectProps} 'imtbl-connect' - Props for the 'imtbl-connect' component.
 * @property {ImtblWalletProps} 'imtbl-wallet' - Props for the 'imtbl-wallet' component.
 * @property {ImtblSwapProps} 'imtbl-swap' - Props for the 'imtbl-swap' component.
 * @property {ImtblBridgeProps} 'imtbl-bridge' - Props for the 'imtbl-bridge' component.
 * @property {ImtblOnRampProps} 'imtbl-onramp' - Props for the 'imtbl-onramp' component.
 * */
declare global {
  interface Window {
    ImtblCheckoutWidgetConfig: any;
  }

  namespace JSX {
    interface IntrinsicElements {
      'imtbl-connect': ImtblConnectProps;
      'imtbl-wallet': ImtblWalletProps;
      'imtbl-swap': ImtblSwapProps;
      'imtbl-bridge': ImtblBridgeProps;
      'imtbl-onramp': ImtblOnRampProps;
      'imtbl-sale': ImtblSaleProps;
    }
  }

  interface ImmutableWebComponent {
    setProvider: Function;
    addPassportOption: Function;
    setAttribute: Function;
  }
}

/**
 * Interface for the properties of a connect web component.
 * Extends the React.DetailedHTMLProps interface to inherit HTML attributes for an HTMLElement.
 * @interface ImtblConnectProps
 * @extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
 * @property {string | undefined} widgetConfig - Optional string representing the widget configuration.
 */
export interface ImtblConnectProps
  extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
  > {
  widgetConfig?: string;
}

/**
 * Interface for the properties of a wallet web component.
 * Extends the React.DetailedHTMLProps interface to inherit HTML attributes for the component's root element.
 * @interface ImtblWalletProps
 * @extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
 * @property {string | undefined} walletProvider - The provider for the wallet.
 * @property {string | undefined} widgetConfig - The configuration for the wallet widget.
 */
export interface ImtblWalletProps
  extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
  > {
  walletProvider?: string;
  widgetConfig?: string;
}

/**
 * Interface for the properties of a swap web component.
 * Extends the React.DetailedHTMLProps interface to inherit HTML attributes for the component's root element.
 * @interface ImtblSwapProps
 * @extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
 * @property {string | undefined} walletProvider - The preferred wallet provider to connect to.
 * @property {string | undefined} widgetConfig - The configuration for the swap widget.
 * @property {string | undefined} amount - The amount to swap.
 * @property {string | undefined} fromContractAddress - The contract address of the source token. If the string is 'NATIVE' then the native token will be used.
 * @property {string | undefined} toContractAddress - The contract address of the destination token. If the string is 'NATIVE' then the native token will be used.
 */
export interface ImtblSwapProps
  extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
  > {
  walletProvider?: string;
  widgetConfig?: string;
  amount?: string;
  fromContractAddress?: string;
  toContractAddress?: string;
}

/**
 * Interface for the properties of a bridge web component.
 * Extends the React.DetailedHTMLProps interface to inherit HTML attributes for the component's root element.
 * @interface ImtblBridgeProps
 * @extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
 * @property {string | undefined} walletProvider - The preferred wallet provider to connect to.
 * @property {string | undefined} widgetConfig - The configuration for the bridge widget.
 * @property {string | undefined} amount - The amount to swap.
 * @property {string | undefined} fromContractAddress - The contract address of the source token.
 */
export interface ImtblBridgeProps
  extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
  > {
  walletProvider?: string;
  widgetConfig?: string;
  fromContractAddress?: string;
  amount?: string;
}

/**
 * Interface for the properties of a bridge web component.
 * Extends the React.DetailedHTMLProps interface to inherit HTML attributes for the component's root element.
 * @interface ImtblOnRampProps
 * @extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
 * @property {string | undefined} walletProvider - The preferred wallet provider to connect to.
 * @property {string | undefined} widgetConfig - The configuration for the bridge widget.
 * @property {string | undefined} amount - The amount to onramp.
 * @property {string | undefined} contractAddress - The contract address of the token to on ramp.
 */
export interface ImtblOnRampProps
  extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
  > {
  walletProvider?: string;
  widgetConfig?: string;
  amount?: string;
  contractAddress?: string;
}

/**
 * Interface for the properties of the Sale web component.
 * Extends the React.DetailedHTMLProps interface to inherit HTML attributes for an HTMLElement.
 * @interface ImtblSaleProps
 * @extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
 * @property {string | undefined} widgetConfig - Optional string representing the widget configuration.
 * @property {string | undefined} amount - The amount to be paid.
 * @property {string | undefined} products - A base64 encoded string of the array of items to be purchased.
 * @property {string | undefined} fromContractAddress - The contract address of the token to pay with.
 * @property {string | undefined} env - The environment to use: SANDBOX, DEV, PRODUCTION, ...
 * @property {string | undefined} environmentId - The environment id from Immutable Hub.
 */
export interface ImtblSaleProps
  extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
  > {
  widgetConfig?: string;
  amount: string;
  products: string;
  fromContractAddress: string;
  env: string;
  environmentId: string;
}
