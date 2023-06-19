import { Box } from "@biom3/react";
import { BridgeReact, ConnectReact, SwapReact, WalletReact } from "@imtbl/checkout-widgets";

export interface ImtblWidgetsProps {
  providerPreference: string;
  showConnect: boolean;
  showWallet: boolean;
  showSwap: boolean;
  showBridge: boolean;
}

export const ImtblWidgets = ({
  providerPreference,
  showConnect,
  showWallet,
  showSwap,
  showBridge,
}: ImtblWidgetsProps) => {

  return(
    <Box>
      {showConnect && (<ConnectReact />)}
      {showWallet && (<WalletReact providerPreference={providerPreference} />)}
      {showSwap && (<SwapReact providerPreference={providerPreference} />)}
      {showBridge && (<BridgeReact providerPreference={providerPreference} />)}
    </Box>
  )
}