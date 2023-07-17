import { Actions, AppCtx } from '../Context/app-context';
import { Box, Heading, Button } from '@biom3/react';
import { useContext } from 'react';
import { MetaMaskIMXProvider, WalletConnectIMXProvider } from '@imtbl/sdk';

export const DisconnectButton = () => {
  const { state, dispatch } = useContext(AppCtx);

  const disconnect = async () => {
    if(state.providerName === 'metamask') {
      await MetaMaskIMXProvider.disconnect();
    } else if(state.providerName === 'walletconnect') {
      await WalletConnectIMXProvider.disconnect();
    }


    dispatch({
      payload: {
        type: Actions.MetaMaskIMXProviderDisconnected,
      },
    });
  };

  return (
    <>
      {state.address && (
        <Box sx={{ padding: 'base.spacing.x5' }}>
          <Heading size="medium">Disconnect</Heading>
          <Button onClick={() => disconnect()}>Disconnect</Button>
        </Box>
      )}
    </>
  );
};
