import {
  Checkout, CommerceFlowType, CommerceWidgetConfiguration, WrappedBrowserProvider,
} from '@imtbl/checkout-sdk';
import { ConnectLoaderParams } from '../../../components/ConnectLoader/ConnectLoader';
import { View } from '../../../context/view-context/ViewContext';

/**
 * Get the connect loader params for the widget
 */
export function getConnectLoaderParams(
  view: View,
  flowConfig: CommerceWidgetConfiguration,
  checkout: Checkout,
  browserProvider: WrappedBrowserProvider | undefined,
): ConnectLoaderParams {
  const { type } = view;

  switch (type) {
    case CommerceFlowType.WALLET:
      return {
        checkout,
        browserProvider,
        targetChainId: checkout.config.l2ChainId,
        allowedChains: [
          checkout.config.l1ChainId,
          checkout.config.l2ChainId,
        ],
        allowlistWalletRdns: flowConfig.CONNECT?.allowlistWalletRdns,
        blocklistWalletRdns: flowConfig.CONNECT?.blocklistWalletRdns ?? [],
        targetWalletRdns: flowConfig.CONNECT?.targetWalletRdns,
        walletProviderName: undefined,
      };
    case CommerceFlowType.ONRAMP:
    case CommerceFlowType.ADD_TOKENS:
      return {
        checkout,
        browserProvider,
        targetChainId: checkout.config.l2ChainId,
        allowedChains: [
          checkout.config.l1ChainId,
          checkout.config.l2ChainId,
        ],
        allowlistWalletRdns: flowConfig.CONNECT?.allowlistWalletRdns,
        blocklistWalletRdns: flowConfig.CONNECT?.blocklistWalletRdns ?? [],
        targetWalletRdns: flowConfig.CONNECT?.targetWalletRdns,
        walletProviderName: undefined,
      };
    case CommerceFlowType.SALE:
    case CommerceFlowType.SWAP:
    case CommerceFlowType.TRANSFER:
      return {
        checkout,
        browserProvider,
        targetChainId: checkout.config.l2ChainId,
        allowedChains: [checkout.config.l2ChainId],
        allowlistWalletRdns: flowConfig.CONNECT?.allowlistWalletRdns,
        blocklistWalletRdns: flowConfig.CONNECT?.blocklistWalletRdns ?? [],
        targetWalletRdns: flowConfig.CONNECT?.targetWalletRdns,
        walletProviderName: undefined,
      };
    default:
      return {} as ConnectLoaderParams;
  }
}
