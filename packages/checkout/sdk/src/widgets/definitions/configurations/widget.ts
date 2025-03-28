import { WidgetTheme } from './theme';

/**
 * Widget Configuration represents the shared configuration options for the Commerce Widgets.
 * @property {WidgetTheme | undefined} theme
 * @property {WidgetLanguage | undefined} language
 * @property {WalletConnectConfig | undefined} walletConnect
 */
export type WidgetConfiguration = {
  /** The theme of the Commerce Widget (default: "DARK") */
  theme?: WidgetTheme;
  language?: WidgetLanguage;
  walletConnect?: WalletConnectConfig;
};

/**
 * Widget Language represents the language options for the Commerce Widgets.
 */
export type WidgetLanguage = 'en' | 'ja' | 'ko' | 'zh';

/**
 * WalletConnect Config represents the configuration required to enable WalletConnect for the Commerce Widgets.
 */
export type WalletConnectConfig = {
  /** WalletConnect projectId */
  projectId: string;
  /** Dapp metadata that will be displayed on wallet connection and transaction approvals. */
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
};
