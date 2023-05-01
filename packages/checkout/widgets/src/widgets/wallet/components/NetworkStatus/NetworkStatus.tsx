import { Body, Box, HorizontalMenu, Icon } from '@biom3/react';
import { useCallback, useContext } from 'react';
import { WalletActions, WalletContext } from '../../context/WalletContext';
import { ChainId, Checkout, SwitchNetworkParams } from '@imtbl/checkout-sdk-web';
import { sendNetworkSwitchEvent } from '../../WalletWidgetEvents';
import { Web3Provider } from '@ethersproject/providers';
import { Button } from '@biom3/react';
import { Network } from '@imtbl/checkout-ui-types';
import { ActiveNetworkButtonStyles } from './NetworkStatusStyles';
import { text } from '../../../../resources/text/textConfig';
import { WalletWidgetViews } from '../../../../context/WalletViewContextTypes';

interface NetworkStatusProps {
  networkName: string;
  getTokenBalances: (checkout: Checkout, provider: Web3Provider, networkName: string, chainId: ChainId) => void;
}

export const NetworkStatus = (props: NetworkStatusProps) => {
  const { networkName, getTokenBalances } = props;
  const {walletState, walletDispatch} = useContext(WalletContext);
  const {networkStatus} = text.views[WalletWidgetViews.WALLET_BALANCES]

  const switchNetwork = useCallback(async (chainId: ChainId) => {
    if(walletState.checkout && walletState.provider && walletState.network?.chainId !== chainId) {
      try {
        const switchNetworkResult = await walletState.checkout.switchNetwork({
          provider: walletState.provider,
          chainId: chainId,
        } as SwitchNetworkParams);
        walletDispatch({
          payload: {
            type: WalletActions.SET_PROVIDER,
            provider: switchNetworkResult.provider
          }
        });
        walletDispatch({
          payload: {
            type: WalletActions.SET_NETWORK_INFO,
            network: switchNetworkResult.network
          }
        });
        await getTokenBalances(
          walletState.checkout,
          switchNetworkResult.provider,
          switchNetworkResult.network.name,
          switchNetworkResult.network.chainId
        );
        sendNetworkSwitchEvent(switchNetworkResult.network);
      } catch (err) {
        // user proably rejected the switch network request
        // should we do anything here...
      }
    }
  }, [walletState.checkout, walletState.provider, walletState.network?.chainId, getTokenBalances, walletDispatch]);
  

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
        <HorizontalMenu.Button
          testId={networkName === Network.POLYGON ? 'active-network-button' : 'other-network-button'}
          sx={networkName === Network.POLYGON ? ActiveNetworkButtonStyles : {}} 
          size='medium' 
          onClick={() => switchNetwork(ChainId.POLYGON)}>
            <Button.Logo logo='ImmutableSymbol' sx={{paddingRight: 'base.spacing.x1'}} />{networkStatus.network1Name}
        </HorizontalMenu.Button>
        <HorizontalMenu.Button 
          testId={networkName === Network.ETHEREUM ? 'active-network-button' : 'other-network-button'}
          sx={networkName === Network.ETHEREUM ? ActiveNetworkButtonStyles : {}} 
          size="medium" 
          onClick={() => switchNetwork(ChainId.ETHEREUM)}>
            <Button.Logo logo='ImmutableSymbol' sx={{paddingRight: 'base.spacing.x1'}} />{networkStatus.network2Name}
        </HorizontalMenu.Button>
      </HorizontalMenu>
    </Box>
  );
};
