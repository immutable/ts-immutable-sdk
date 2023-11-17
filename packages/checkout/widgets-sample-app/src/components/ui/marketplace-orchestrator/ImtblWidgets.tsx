import { Web3Provider } from '@ethersproject/providers';
import { Box } from "@biom3/react";
import { ShowWidget } from './WidgetProvider';
import { Passport } from '@imtbl/passport';

export interface ImtblWidgetsProps {
  web3Provider?: Web3Provider;
  passport?: Passport;
  showConnect: ShowWidget;
  showWallet: ShowWidget;
  showSwap: ShowWidget;
  showBridge: ShowWidget;
  showOnRamp: ShowWidget;
}

export const ImtblWidgets = ({
  web3Provider,
  passport,
  showConnect,
  showWallet,
  showSwap,
  showBridge,
  showOnRamp,
}: ImtblWidgetsProps) => {

  return(
  <Box></Box>
  )
}