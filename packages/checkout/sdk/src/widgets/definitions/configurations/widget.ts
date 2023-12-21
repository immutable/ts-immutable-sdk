import { WidgetTheme } from './theme';

/**
 * Widget Configuration represents the shared configuration options for the Checkout Widgets.
 * @property {WidgetTheme | undefined} theme
 */
export type WidgetConfiguration = {
  /** The theme of the Checkout Widget (default: "DARK") */
  theme?: WidgetTheme;
  language?: WidgetLanguage;
};

/**
 * Widget Language represents the language options for the Checkout Widgets.
 */
export type WidgetLanguage = 'en' | 'ja' | 'ko' | 'zh';
