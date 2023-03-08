import { BiomeThemeProvider, Heading } from '@biom3/react'
import { Environment } from './constants';
import { ConnectButton } from './Components/connect-button';
import { Actions, AppCtx, appReducer, initialState } from './Context/app-context';
import { useEffect, useReducer } from 'react';
import { WalletDisplay } from './Components/wallet-display';
import { SignMessage } from './Components/sign-message';
import { DisconnectButton } from './Components/disconnect-button';

export const App = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    dispatch({
      payload: {
          type: Actions.SetEnvironment,
          env: Environment.PRODUCTION
      }
    });
  }, [])

  return (
    <BiomeThemeProvider>
      <AppCtx.Provider value={{state: state, dispatch: dispatch}}>
        <Heading size="large">Sample App</Heading>
        <WalletDisplay />
        <ConnectButton />
        <SignMessage />
          <DisconnectButton />
      </AppCtx.Provider>
    </BiomeThemeProvider>
  );
}

export default App;
