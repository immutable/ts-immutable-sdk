import { Actions, AppCtx } from '../context/app-context';
import { Button, FormControl, TextInput, Heading } from '@biom3/react';
import { ChangeEvent, useContext, useState } from 'react';
import { MetaMaskIMXProvider } from 'ts-immutable-sdk';

export const SignMessage = () => {
    const { state, dispatch } = useContext(AppCtx);
    const [signMessage, setSignMessage] = useState('');

    const renderSignForm = () => {
        return (
            <>
                <Heading size='medium'>Sign a message</Heading>
                <FormControl>
                    <TextInput
                        sx={{ w: 'base.border.size.100' }}
                        onChange={updateSignMessage}
                    />
                </FormControl>
                <Button onClick={() => sign()}>Sign</Button>
            </>
        )
    }

    const updateSignMessage = (event: ChangeEvent<HTMLInputElement>) => {
        const hex = Buffer.from(event.target.value, 'utf8').toString('hex');
        setSignMessage(hex);
    }

    const sign = async () => {
        const signedMessage = await MetaMaskIMXProvider.signMessage(signMessage);
        dispatch({
            payload: {
               type: Actions.MetaMaskIMXProviderSignMessage,
               signedMessage,
            },
        });
    }

    return(
        <>
            { state.address && renderSignForm() }
            { state.signedMessage && <>{`Signed message: ${state.signedMessage}`}</> }
        </>
    )
}
