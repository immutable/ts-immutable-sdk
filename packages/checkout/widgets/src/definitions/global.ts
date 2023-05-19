import React from 'react';

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
  providerPreference: string;
  theme: string;
  environment: string;
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
  providerPreference: string;
  useConnectWidget?: string;
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
  theme: string;
  environment: string;
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
  theme: string;
  environment: string;
  fromContractAddress: string;
  fromNetwork: string;
  amount: string;
}

/**
 * Props for the Example Widget component
 * @property {string} providerPreference - The preferred wallet provider to connect to.
 * @property {string} theme - The theme to use.
 * @property {string} environment - The environment configuration
 * @experimental
 */
export interface ImtblExampleProps
  extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
  > {
  providerPreference: string;
  theme: string;
  environment: string;
}

/**
 * Props for the Buy Widget component
 * @property {string} providerPreference - The preferred wallet provider to connect to.
 * @property {string} theme - The theme to use.
 * @property {string} environment - The environment configuration
 * @property {string} orderId - The id of the order to buy.
 */
export interface ImtblBuyProps
  extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
  > {
  providerPreference: string;
  theme: string;
  environment: string;
  orderId: string;
}

/**
 * Props for the TransitionExample Widget component
 * @property {string} providerPreference - The preferred wallet provider to connect to.
 * @property {string} theme - The theme to use.
 * @property {string} environment - The environment configuration
 */
export interface ImtblTransitionExampleProps
  extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
  > {
  providerPreference: string;
  theme: string;
  environment: string;
}

/**
 * Props for the InnerWidgetExample Widget component
 * @property {string} providerPreference - The preferred wallet provider to connect to.
 * @property {string} theme - The theme to use.
 * @property {string} environment - The environment configuration
 */
export interface ImtblInnerWidgetExampleProps
  extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
  > {
  providerPreference: string;
  theme: string;
  environment: string;
}

/**
 * Props for the OuterWidgetExample Widget component
 * @property {string} providerPreference - The preferred wallet provider to connect to.
 * @property {string} theme - The theme to use.
 * @property {string} environment - The environment configuration
 */
export interface ImtblOuterWidgetExampleProps
  extends React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
  > {
  providerPreference: string;
  theme: string;
  environment: string;
}
