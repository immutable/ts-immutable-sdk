import { Actions, AppCtx, appReducer, initialState } from './Context/app-context';
import { BiomeThemeProvider, Heading } from '@biom3/react'
import { ConnectButton } from './Components/connect-button';
import { DisconnectButton } from './Components/disconnect-button';
import { Environment } from 'ts-immutable-sdk';
import { SignMessage } from './Components/sign-message';
import { useEffect, useReducer } from 'react';
import { WalletDisplay } from './Components/wallet-display';

export const App = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    dispatch({
      payload: {
          type: Actions.SetEnvironment,
          env: Environment.SANDBOX
      }
    });
  }, [])

  return (
    <BiomeThemeProvider>
      <AppCtx.Provider value={{state: state, dispatch: dispatch}}>
        <Heading size='large'>Sample App</Heading>
        <WalletDisplay />
        <ConnectButton />
        <SignMessage />
          <DisconnectButton />
      </AppCtx.Provider>
    </BiomeThemeProvider>
  );
}

export default App;
