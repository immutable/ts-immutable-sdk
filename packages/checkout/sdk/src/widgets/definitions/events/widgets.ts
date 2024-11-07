import { BrowserProvider } from 'ethers';
import { WidgetLanguage } from '../configurations';

/**
 * Enum representing the events emitted by the widgets.
 */
export enum IMTBLWidgetEvents {
  IMTBL_WIDGETS_PROVIDER = 'imtbl-widgets-provider',
  IMTBL_CONNECT_WIDGET_EVENT = 'imtbl-connect-widget',
  IMTBL_WALLET_WIDGET_EVENT = 'imtbl-wallet-widget',
  IMTBL_SWAP_WIDGET_EVENT = 'imtbl-swap-widget',
  IMTBL_BRIDGE_WIDGET_EVENT = 'imtbl-bridge-widget',
  IMTBL_ONRAMP_WIDGET_EVENT = 'imtbl-onramp-widget',
  IMTBL_SALE_WIDGET_EVENT = 'imtbl-sale-widget',
  IMTBL_COMMERCE_WIDGET_EVENT = 'imtbl-commerce-widget',
  IMTBL_ADD_TOKENS_WIDGET_EVENT = 'imtbl-add-tokens-widget',
  IMTBL_PURCHASE_WIDGET_EVENT = 'imtbl-purchase-widget',
}

/**
 * Enum for events raised for about provider objects
 */
export enum ProviderEventType {
  PROVIDER_UPDATED = 'PROVIDER_UPDATED',
}

/**
 * Payload type for the PROVIDER_UPDATED event
 */
export type ProviderUpdated = {
  provider: BrowserProvider;
};

/**
 * Payload type for the LANGUAGE_CHANGED event
 */
export type LanguageChanged = {
  language: WidgetLanguage;
};
