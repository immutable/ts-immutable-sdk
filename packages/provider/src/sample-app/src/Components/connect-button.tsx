import { Box, Button } from '@biom3/react';
import { MetaMaskIMXProvider, ProviderConfiguration } from '@imtbl/provider';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { useContext } from 'react';
import { Actions, AppCtx } from '../context/app-context';

export const ConnectButton = () => {
  const { state, dispatch } = useContext(AppCtx);

  const wrapperMetaMaskConnect = async () => {
    const metaMaskIMXProvider = await MetaMaskIMXProvider.connect(
      new ProviderConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.PRODUCTION,
        }),
      })
    );

    dispatch({
      payload: {
        type: Actions.MetaMaskIMXProviderConnected,
        metaMaskIMXProvider,
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
