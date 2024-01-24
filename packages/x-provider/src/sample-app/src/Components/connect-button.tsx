import { Box, Button } from '@biom3/react';
import { provider } from '@imtbl/sdk';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { useContext } from 'react';
import { Actions, AppCtx } from '../Context/app-context';

export const ConnectButton = () => {
  const { state, dispatch } = useContext(AppCtx);

  const wrapperMetaMaskConnect = async () => {
    const metaMaskIMXProvider = await provider.MetaMaskIMXProvider.connect(
      new provider.ProviderConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.PRODUCTION,
        }),
      })
    );

    dispatch({
      payload: {
        type: Actions.MetaMaskIMXProviderConnected,
        metaMaskIMXProvider: metaMaskIMXProvider,
        address: await metaMaskIMXProvider.getAddress(),
      },
    });
  };

  return (
    <>
      {!state.address && (
        <Box sx={{ padding: 'base.spacing.x5' }}>
          <Button onClick={() => wrapperMetaMaskConnect()}>
            Connect to MetaMask
          </Button>
        </Box>
      )}
    </>
  );
};
