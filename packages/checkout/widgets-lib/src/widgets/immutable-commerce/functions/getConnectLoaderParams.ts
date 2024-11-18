import {
  ChainId, Checkout, CommerceFlowType, NamedBrowserProvider,
} from '@imtbl/checkout-sdk';
import { ConnectLoaderParams } from '../../../components/ConnectLoader/ConnectLoader';
import { getL1ChainId, getL2ChainId } from '../../../lib/networkUtils';
import { View } from '../../../context/view-context/ViewContext';

/**
 * Get the chain id for the checkout
 */
const getChainId = (checkout: Checkout) => (checkout.config.isProduction
  ? ChainId.IMTBL_ZKEVM_MAINNET
  : ChainId.IMTBL_ZKEVM_TESTNET);

/**
 * Get the connect loader params for the widget
 */
export function getConnectLoaderParams(
  view: View,
  checkout: Checkout,
  browserProvider: NamedBrowserProvider | undefined,
): ConnectLoaderParams {
  const { type } = view;

  switch (type) {
    case CommerceFlowType.WALLET:
      return {
        checkout,
        browserProvider,
        targetChainId: getChainId(checkout),
        allowedChains: [
          getL1ChainId(checkout.config),
          getL2ChainId(checkout.config),
        ],
      };
    case CommerceFlowType.ONRAMP:
    case CommerceFlowType.ADD_TOKENS:
      return {
        checkout,
        browserProvider,
        targetChainId: getChainId(checkout),
        allowedChains: [
          getL1ChainId(checkout.config),
          getL2ChainId(checkout.config),
        ],
      };
    case CommerceFlowType.SALE:
    case CommerceFlowType.SWAP:
      return {
        checkout,
        browserProvider,
        targetChainId: getChainId(checkout),
        allowedChains: [getL2ChainId(checkout.config)],
      };
    default:
      return {} as ConnectLoaderParams;
  }
}
