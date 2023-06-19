/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';

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
    }
  }

  interface ImmutableWebComponent {
    setProvider: Function;
    setAttribute: Function;
  }
}

/**
 * Props for the Connect Widget component
 * @property {string} providerPreference - The preferred wallet provider to connect to.
 * @property {string} theme - The theme to use.
 * @property {string} environment - The environment configuration
 */
export interface ImtblConnectProps
  extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
  > {
  walletProvider?: string;
  widgetConfig?: string;
}

/**
 * Props for the Wallet Widget component
 * @property {string} providerPreference - The preferred wallet provider to connect to.
 * @property {string} theme - The theme to use.
 * @property {string} environment - The environment configuration
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
 * Props for the Swap Widget component
 * @property {string} providerPreference - The preferred wallet provider to connect to.
 * @property {string} theme - The theme to use.
 * @property {string} environment - The environment configuration
 * @property {string} amount - The amount to swap.
 * @property {string} fromContractAddress - The contract address of the source token.
 * @property {string} toContractAddress - The contract address of the destination token.
 */
export interface ImtblSwapProps
  extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
  > {
  providerPreference: string;
  widgetConfig?: string;
  useConnectWidget?: string;
  amount: string;
  fromContractAddress: string;
  toContractAddress: string;
}

/**
 * Props for the Bridge Widget component
 * @property {string} providerPreference - The preferred wallet provider to connect to.
 * @property {string} theme - The theme to use.
 * @property {string} environment - The environment configuration
 * @property {string} fromContractAddress - The contract address of the source token.
 * @property {string} fromNetwork - The network of the source token.
 * @property {string} amount - The amount to bridge.
 */
export interface ImtblBridgeProps
  extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
  > {
  providerPreference: string;
  widgetConfig?: string;
  fromContractAddress: string;
  fromNetwork: string;
  amount: string;
}
