import { Box, Button } from '@biom3/react';
import { x } from '@imtbl/sdk';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { useContext } from 'react';
import { Actions, AppCtx } from '../Context/app-context';

export const ConnectButton = () => {
  const { state, dispatch } = useContext(AppCtx);

  const wrapperMetaMaskConnect = async () => {
    const metaMaskIMXProvider = await x.MetaMaskIMXProvider.connect(
      new x.ProviderConfiguration({
        baseConfig: new ImmutableConfiguration({
          environment: Environment.PRODUCTION,
        }),
        overrides: undefined,
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
