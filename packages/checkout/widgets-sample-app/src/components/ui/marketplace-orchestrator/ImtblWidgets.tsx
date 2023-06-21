import { Web3Provider } from '@ethersproject/providers';
import { Box } from "@biom3/react";
import { BridgeReact, CheckoutWidgetTagNames, ConnectReact, SetProvider, SwapReact, WalletReact } from "@imtbl/checkout-widgets";

export interface ImtblWidgetsProps {
  web3Provider: Web3Provider|null;
  showConnect: boolean;
  showWallet: boolean;
  showSwap: boolean;
  showBridge: boolean;
  params: any;
}

export const ImtblWidgets = ({
  web3Provider,
  showConnect,
  showWallet,
  showSwap,
  showBridge,
  params,
}: ImtblWidgetsProps) => {

  if(web3Provider && showConnect) {
    SetProvider(CheckoutWidgetTagNames.CONNECT, web3Provider)
  }

  if(web3Provider && showWallet) {
    SetProvider(CheckoutWidgetTagNames.WALLET, web3Provider)
  }

  if(web3Provider && showSwap) {
    SetProvider(CheckoutWidgetTagNames.SWAP, web3Provider)
  }
  
  if(web3Provider && showBridge) {
    SetProvider(CheckoutWidgetTagNames.BRIDGE, web3Provider)
  } 

  return(
    <Box>
      {showConnect && (<ConnectReact />)}
      {showWallet && (<WalletReact />)}
      {showSwap && (<SwapReact />)}
      {showBridge && (<BridgeReact />)}
    </Box>
  )
}
