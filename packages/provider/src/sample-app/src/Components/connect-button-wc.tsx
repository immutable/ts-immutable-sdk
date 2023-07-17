import { Box, Button } from '@biom3/react';
import { WalletConnectIMXProvider, ProviderConfiguration } from '@imtbl/sdk';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { useContext } from 'react';
import { Actions, AppCtx } from '../Context/app-context';

export const ConnectButtonWC = () => {
  const { state, dispatch } = useContext(AppCtx);

  const wrapperMetaMaskConnect = async () => {
    const walletConnectIMXProvider = await WalletConnectIMXProvider.connect(
      new ProviderConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.PRODUCTION,
        }),
      }),
      {
        projectId: '530784f762cf3e62f1d8512fda22627c',
        chains: [1]
      }
    );

    dispatch({
      payload: {
        type: Actions.MetaMaskIMXProviderConnected,
        metaMaskIMXProvider: walletConnectIMXProvider,
        address: await walletConnectIMXProvider.getAddress(),
        providerName: 'walletconnect'
      },
    });
  };

  return (
    <>
      {!state.address && (
        <Box sx={{ padding: 'base.spacing.x5' }}>
          <Button onClick={() => wrapperMetaMaskConnect()}>
            Connect to Wallet Connect
          </Button>
        </Box>
      )}
    </>
  );
};
