import { Actions, AppCtx } from '../Context/app-context';
import { MetaMaskProvider, Configuration, PRODUCTION } from 'ts-immutable-sdk';
import { useContext } from 'react';
import {Button } from '@biom3/react'

export const ConnectButton = () => {
   const { state, dispatch } = useContext(AppCtx);

   const wrapperMetaMaskConnect = async () => {
      const metaMaskProvider = await MetaMaskProvider.connect(new Configuration(PRODUCTION));

      dispatch({
         payload: {
            type: Actions.MetaMaskProviderConnected,
            metaMaskProvider,
            address: await metaMaskProvider.getAddress(),
         },
      });
   }

   return (
      <>
         {!state.address && 
            <>
               <Button onClick={() => wrapperMetaMaskConnect()}>
                  Connect to MetaMask
               </Button>
            </>
         }
      </>
   )
}
