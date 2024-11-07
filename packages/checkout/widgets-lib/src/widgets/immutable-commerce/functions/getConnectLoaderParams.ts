import { ChainId, Checkout, CommerceFlowType } from '@imtbl/checkout-sdk';
import { BrowserProvider } from 'ethers';
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
  web3Provider: BrowserProvider | undefined,
): ConnectLoaderParams {
  const { type, data } = view;

  switch (type) {
    case CommerceFlowType.WALLET:
      return {
        checkout,
        web3Provider,
        targetChainId: getChainId(checkout),
        walletProviderName: data.params.walletProviderName,
        allowedChains: [
          getL1ChainId(checkout.config),
          getL2ChainId(checkout.config),
        ],
      };
    case CommerceFlowType.ONRAMP:
    case CommerceFlowType.ADD_TOKENS:
      return {
        checkout,
        web3Provider,
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
        web3Provider,
        targetChainId: getChainId(checkout),
        allowedChains: [getL2ChainId(checkout.config)],
      };
    default:
      return {} as ConnectLoaderParams;
  }
}
