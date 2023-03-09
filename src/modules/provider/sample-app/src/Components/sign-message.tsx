import { AppCtx } from '../Context/app-context';
import { Button, FormControl, TextInput, Heading } from '@biom3/react';
import { ChangeEvent, useContext, useState } from 'react';

export const SignMessage = () => {
    const { state } = useContext(AppCtx);
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
        // todo: implement sign when actually implemented in wrapper
        console.log(signMessage);
    }

    return(
        <>
            { state.address && renderSignForm() }
        </>
    )
}
