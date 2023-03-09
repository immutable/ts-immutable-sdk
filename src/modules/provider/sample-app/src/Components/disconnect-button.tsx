import { Actions, AppCtx } from '../context/app-context';
import { Heading, Button } from '@biom3/react';
import { useContext } from 'react';
import { MetaMaskIMXProvider } from 'ts-immutable-sdk';

export const DisconnectButton = () => {
    const { state, dispatch } = useContext(AppCtx);

    const disconnect = async () => {
        await MetaMaskIMXProvider.disconnect();

        dispatch({
            payload: {
               type: Actions.MetaMaskIMXProviderDisconnected,
            },
        });
     }
    
    return(
        <>
            {state.address &&
                <>
                    <Heading size='medium'>Disconnect</Heading>
                    <Button onClick={() => disconnect()}>
                        Disconnect
                    </Button>
                </>
            }
        </>
    )
}
