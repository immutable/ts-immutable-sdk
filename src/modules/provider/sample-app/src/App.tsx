import './App.css';

import { connect, imxConnect } from 'ts-immutable-sdk';
import { ImxSigner } from 'ts-immutable-sdk';
import { Web3Provider } from '@ethersproject/providers/lib/web3-provider';

import { BiomeThemeProvider, Heading } from '@biom3/react'
import { Environment } from './constants';
import { ConnectButton } from './Components/connect-button';
import { Actions, AppCtx, appReducer, initialState } from './Context/app-context';
import { useEffect, useReducer } from 'react';
import { WalletDisplay } from './Components/wallet-display';
import { SignMessage } from './Components/sign-message';
import { DisconnectButton } from './Components/disconnect-button';

// Connects to metamask to get a ethers web3 provider object
// Uses metamask as the web3 provider to also get a connection to L2
// const connectMetamask = async () => {
//   web3provider = await connect({ chainID: 1 })
//   imxSigner = await imxConnect(web3provider, Environment.PRODUCTION);
//   console.log("l1 address: ", await web3provider.getSigner().getAddress());
//   console.log("l2 address: ", imxSigner.getAddress());
// }

// Signs a message using the L2 imx signer
// const sign = async () => {
//   await imxSigner.signMessage("0x0")
//   await web3provider.getSigner().signMessage("some string");
// }

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
