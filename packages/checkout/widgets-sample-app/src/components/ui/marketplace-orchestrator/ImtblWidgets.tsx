import { Web3Provider } from '@ethersproject/providers';
import { Box } from "@biom3/react";
import { BridgeReact, ConnectReact, SwapReact, WalletReact } from "@imtbl/checkout-widgets";
import { ShowWidget } from './WidgetProvider';
import { Passport } from '@imtbl/passport';

export interface ImtblWidgetsProps {
  web3Provider?: Web3Provider;
  passport?: Passport;
  showConnect: ShowWidget;
  showWallet: ShowWidget;
  showSwap: ShowWidget;
  showBridge: ShowWidget;
}

export const ImtblWidgets = ({
  web3Provider,
  passport,
  showConnect,
  showWallet,
  showSwap,
  showBridge,
}: ImtblWidgetsProps) => {

  return(
    <Box>
      {showConnect.show && (<ConnectReact passport={passport} />)}
      {showWallet.show && (<WalletReact provider={web3Provider} passport={passport} />)}
      {showSwap.show && (<SwapReact
        provider={web3Provider}
        passport={passport}
        fromContractAddress={showSwap.data?.fromTokenAddress || ''}
        toContractAddress={showSwap.data?.toTokenAddress || ''}
        amount={showSwap.data?.amount || ''}/>
        )}
      {showBridge.show && (<BridgeReact
        provider={web3Provider}
        passport={passport}
        fromContractAddress={showBridge.data?.tokenAddress || ''}
        amount={showBridge.data?.amount || ''}
      /> )}
    </Box>
  )
}