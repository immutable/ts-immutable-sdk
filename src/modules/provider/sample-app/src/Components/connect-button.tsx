import {Button, Heading } from '@biom3/react'
import { useContext } from 'react';
import { connect, imxConnect } from 'ts-immutable-sdk';
import { Actions, AppCtx } from '../Context/app-context';

import { MetaMaskProvider, Configuration, PRODUCTION } from 'ts-immutable-sdk';

export const ConnectButton = () => {
   const { state, dispatch } = useContext(AppCtx);

   const connectMetaMask = async () => {
      const web3provider = await connect({ chainID: 1 })
      const imxSigner = await imxConnect(web3provider, state.env);
      const layer1address = await web3provider.getSigner().getAddress();
      const layer2address = imxSigner.getAddress();
      console.log("l1 address: ", layer1address);
      console.log("l2 address: ", layer2address);

      dispatch({
         payload: {
            type: Actions.WalletConnected,
            web3provider,
            imxSigner,
            layer1address,
            layer2address,
         },
      });
   }

   const wrapperMetaMaskConnect = async () => {
      const metamaskProvider = await MetaMaskProvider.connect(new Configuration(PRODUCTION));
      console.log(await metamaskProvider.getAddress());

      dispatch({
         payload: {
            type: Actions.MetamaskProviderConnected,
            metamaskProvider,
         },
      });
   }

   return (
      <>
         {!state.layer1address && 
            <>
               <Heading size='medium'>Connect to MetaMask</Heading>
               <Button onClick={() => connectMetaMask()}>
                  Connect
               </Button>
               <Button onClick={() => wrapperMetaMaskConnect()}>
                  Wrapper Connect
               </Button>
            </>
         }
      </>
   )
}
