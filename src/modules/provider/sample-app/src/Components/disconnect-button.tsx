import { Actions, AppCtx } from '../Context/app-context';
import { Heading, Button } from '@biom3/react';
import { useContext } from 'react';

export const DisconnectButton = () => {
    const { state, dispatch } = useContext(AppCtx);

    const disconnect = async () => {
        // todo: implement when disconnect added to wrapper
        console.log('disconnected from metamask');

        dispatch({
            payload: {
               type: Actions.MetaMaskProviderDisconnected,
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
