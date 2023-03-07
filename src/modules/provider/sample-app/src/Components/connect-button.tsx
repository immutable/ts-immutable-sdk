import {Button, Heading } from '@biom3/react'
import { Web3Provider } from '@ethersproject/providers/lib/web3-provider';
import { useContext } from 'react';
import { ImxSigner } from 'ts-immutable-sdk';
import { connect, imxConnect } from 'ts-immutable-sdk';
import { Environment } from '../constants';
import { Actions, AppCtx } from '../Context/app-context';

export const ConnectButton = () => {
   const { state, dispatch } = useContext(AppCtx);

   const connectMetamask = async () => {
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

   return (
      <>
         {!state.layer1address && 
            <>
               <Heading size='medium'>Connect to MetaMask</Heading>
               <Button onClick={() => connectMetamask()}>
                  Connect
               </Button>
            </>
         }
      </>
   )
}
