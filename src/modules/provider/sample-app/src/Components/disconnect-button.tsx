import { Actions, AppCtx } from '../Context/app-context';
import { Heading, Button } from '@biom3/react';
import { imxDisconnect } from 'ts-immutable-sdk';
import { useContext } from 'react';

export const DisconnectButton = () => {
    const { state, dispatch } = useContext(AppCtx);

    const disconnect = async () => {
        if (state.imxSigner) {
            await imxDisconnect(state.imxSigner);

            dispatch({
               payload: {
                    type: Actions.WalletDisconnected
               },
            });
        }
     }
    
    return(
        <>
            {state.layer1address &&
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
