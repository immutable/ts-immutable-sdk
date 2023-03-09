import { Actions, AppCtx } from '../Context/app-context';
import { MetaMaskIMXProvider, Configuration, PRODUCTION } from 'ts-immutable-sdk';
import { useContext } from 'react';
import {Button } from '@biom3/react'

export const ConnectButton = () => {
   const { state, dispatch } = useContext(AppCtx);

   const wrapperMetaMaskConnect = async () => {
      const metaMaskIMXProvider = await MetaMaskIMXProvider.connect(new Configuration(PRODUCTION));

      dispatch({
         payload: {
            type: Actions.MetaMaskIMXProviderConnected,
            metaMaskIMXProvider,
            address: await metaMaskIMXProvider.getAddress(),
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
