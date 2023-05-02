import { Body, Box, Button, HorizontalMenu, Icon } from "@biom3/react";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { WalletActions, WalletContext } from "../../context/WalletContext";
import { ChainId, Checkout, NetworkFilterTypes, NetworkInfo, SwitchNetworkParams } from "@imtbl/checkout-sdk-web";
import { Web3Provider } from "@ethersproject/providers";
import { text } from "../../../../resources/text/textConfig";
import { WalletWidgetViews } from "../../../../context/WalletViewContextTypes";
import { sendNetworkSwitchEvent } from "../../WalletWidgetEvents";
import { ActiveNetworkButtonStyles } from "./NetworkMenuStyles";

interface NetworkStatusProps {
  getTokenBalances: (checkout: Checkout, provider: Web3Provider, networkName: string, chainId: ChainId) => void;
}

export const NetworkMenu = (props: NetworkStatusProps) => {
  const {walletState, walletDispatch} = useContext(WalletContext);
  const {networkStatus} = text.views[WalletWidgetViews.WALLET_BALANCES]
  const {checkout, network, provider} = walletState;
  const [allowedNetworks, setNetworks] = useState<NetworkInfo[]|undefined>([]);

  //todo: add corresponding network symbols
  const NetworkLogo = {
    [ChainId.POLYGON]: 'ImmutableSymbol',
    [ChainId.ETHEREUM]: 'ImmutableSymbol',
    [ChainId.GOERLI]: 'ImmutableSymbol',
  };

  const switchNetwork = useCallback(async (chainId: ChainId) => {
    if(checkout && provider && network?.chainId !== chainId) {
      try {
        const switchNetworkResult = await checkout.switchNetwork({
          provider,
          chainId,
        } as SwitchNetworkParams);
        walletDispatch({
          payload: {
            type: WalletActions.SET_PROVIDER,
            provider: switchNetworkResult?.provider
          }
        });
        walletDispatch({
          payload: {
            type: WalletActions.SET_NETWORK_INFO,
            network: switchNetworkResult.network
          }
        });
        sendNetworkSwitchEvent(switchNetworkResult.network);
      } catch (err) {
        // user proably rejected the switch network request
        // should we do anything here...
      }
    }
  }, [checkout, provider, network?.chainId, walletDispatch]);

  useEffect(()=>{
    (async ()=>{
      if(checkout) {
        const allowedNetworks = await checkout.getNetworkAllowList({ type: NetworkFilterTypes.ALL });
        setNetworks(allowedNetworks?.networks);
      }
      else{
        setNetworks([]);
      }
    })();

  },[checkout]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        columnGap: 'base.spacing.x1',
        paddingX: 'base.spacing.x3',
        paddingY: 'base.spacing.x2'
        }}>
        <Body size="medium">{networkStatus.heading}</Body>
        <Icon icon='InformationCircle' sx={{width: 'base.icon.size.100'}} />
      </Box>
      <HorizontalMenu>
        {allowedNetworks?.map((networkItem)=>
          <HorizontalMenu.Button
            testId={`${networkItem.name}-network-button`}
            sx={networkItem.chainId === network?.chainId ? ActiveNetworkButtonStyles : {}}
            size="medium"
            onClick={() => switchNetwork(networkItem.chainId)}>
            <Button.Logo
              logo={NetworkLogo[networkItem.chainId]}
              sx={{paddingRight: 'base.spacing.x1',  width: '22px'}} />
            {networkItem.name}
          </HorizontalMenu.Button>
        )}
      </HorizontalMenu>
    </Box>
  );
};
