import {
  Actions,
  AppCtx,
  appReducer,
  initialState,
} from './Context/app-context';
import { BiomeCombinedProviders, Heading } from '@biom3/react';
import { ConnectButton } from './Components/connect-button';
import { DisconnectButton } from './Components/disconnect-button';
import { config } from '@imtbl/sdk';
import { SignMessage } from './Components/sign-message';
import { useEffect, useReducer } from 'react';
import { WalletDisplay } from './Components/wallet-display';
import { CreateOrder } from './Components/create-order';
import { CancelOrder } from './Components/cancel-order';
import { CreateTrade } from './Components/create-trade';

export const App = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    dispatch({
      payload: {
        type: Actions.SetEnvironment,
        env: config.Environment.SANDBOX,
      },
    });
  }, []);

  return (
    <BiomeCombinedProviders>
      <AppCtx.Provider value={{ state: state, dispatch: dispatch }}>
        <Heading size="large">Sample App</Heading>
        <WalletDisplay />
        <ConnectButton />
        <SignMessage />
        <CreateOrder />
        <CancelOrder />
        <CreateTrade />
        <DisconnectButton />
      </AppCtx.Provider>
    </BiomeCombinedProviders>
  );
};

export default App;
