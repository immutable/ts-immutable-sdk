import { Web3Provider } from '@ethersproject/providers';
import { Box } from "@biom3/react";
import { BridgeReact, CheckoutWidgetTagNames, ConnectReact, SetProvider, SwapReact, WalletReact } from "@imtbl/checkout-widgets";
import { ShowWidget } from './WidgetProvider';

export interface ImtblWidgetsProps {
  web3Provider: Web3Provider|null;
  showConnect: ShowWidget;
  showWallet: ShowWidget;
  showSwap: ShowWidget;
  showBridge: ShowWidget;
}

export const ImtblWidgets = ({
  web3Provider,
  showConnect,
  showWallet,
  showSwap,
  showBridge,
}: ImtblWidgetsProps) => {

  if(web3Provider && showConnect.show) {
    SetProvider(CheckoutWidgetTagNames.CONNECT, web3Provider)
  }

  if(web3Provider && showWallet.show) {
    SetProvider(CheckoutWidgetTagNames.WALLET, web3Provider)
  }

  if(web3Provider && showSwap.show) {
    SetProvider(CheckoutWidgetTagNames.SWAP, web3Provider)
  }
  
  if(web3Provider && showBridge.show) {
    SetProvider(CheckoutWidgetTagNames.BRIDGE, web3Provider)
  } 

  return(
    <Box>
      {showConnect.show && (<ConnectReact />)}
      {showWallet.show && (<WalletReact />)}
      {showSwap.show && (<SwapReact 
        fromContractAddress={showSwap.data?.fromTokenAddress || ''} 
        toContractAddress={showSwap.data?.toTokenAddress || ''} 
        amount={showSwap.data?.amount || ''}/>
        )}
      {showBridge.show && (<BridgeReact /> )}
    </Box>
  )
}