import { ChainId, Checkout, CheckoutFlowType } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
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
  web3Provider: Web3Provider | undefined,
): ConnectLoaderParams {
  const { type, data } = view;

  switch (type) {
    case CheckoutFlowType.WALLET:
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
    case CheckoutFlowType.ONRAMP:
    case CheckoutFlowType.ADD_FUNDS:
      return {
        checkout,
        web3Provider,
        targetChainId: getChainId(checkout),
        allowedChains: [
          getL1ChainId(checkout.config),
          getL2ChainId(checkout.config),
        ],
      };
    case CheckoutFlowType.SALE:
    case CheckoutFlowType.SWAP:
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
