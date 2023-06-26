import { Web3Provider } from '@ethersproject/providers';
import { Box } from "@biom3/react";
import { BridgeReact, ConnectReact, SwapReact, WalletReact } from "@imtbl/checkout-widgets";
import { ShowWidget } from './WidgetProvider';

export interface ImtblWidgetsProps {
  web3Provider?: Web3Provider;
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

  return(
    <Box>
      {showConnect.show && (<ConnectReact />)}
      {showWallet.show && (<WalletReact provider={web3Provider} />)}
      {showSwap.show && (<SwapReact 
        provider={web3Provider}
        fromContractAddress={showSwap.data?.fromTokenAddress || ''} 
        toContractAddress={showSwap.data?.toTokenAddress || ''} 
        amount={showSwap.data?.amount || ''}/>
        )}
      {showBridge.show && (<BridgeReact provider={web3Provider} /> )}
    </Box>
  )
}