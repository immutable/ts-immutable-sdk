import * as React from 'react';

export interface ImtblConnectProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > {
  providerPreference: string;
  theme: string;
}

export interface ImtblWalletProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > {
  providerPreference: string;
  isOnRampEnabled?: string;
  isSwapEnabled?: string;
  isBridgeEnabled?: string;
  theme: string;
}

export interface ImtblSwapProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > {
  providerPreference: string;
  theme: string;
  amount: string;
  fromContractAddress: string;
  toContractAddress: string;
}

export interface ImtblBridgeProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > {
  providerPreference: string;
  theme: string;
  fromContractAddress: string;
  fromNetwork: string;
  amount: string;
}

export interface ImtblExampleProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > {
  providerPreference: string;
  theme: string;
}

export interface ImtblBuyProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > {
  providerPreference: string;
  theme: string;
  orderId: string;
}

export interface ImtblTransitionExampleProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > {
  providerPreference: string;
  theme: string;
}

export interface ImtblInnerWidgetExampleProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > {
  providerPreference: string;
  theme: string;
}

export interface ImtblOuterWidgetExampleProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > {
  providerPreference: string;
  theme: string;
}
