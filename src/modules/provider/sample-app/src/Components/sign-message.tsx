import { useContext, useState } from 'react';
import { AppCtx } from '../Context/app-context';
import { Button, FormControl, TextInput, Heading } from '@biom3/react';

export const SignMessage = () => {
    const { state } = useContext(AppCtx);
    const [signMessage, setSignMessage] = useState("");

    const renderSignForm = () => {
        return (
            <>
                <Heading size='medium'>Sign a message</Heading>
                <p>Sign a message using the layer 2 IMX signer</p>
                <FormControl>
                    <TextInput
                        sx={{ w: 'base.border.size.100' }}
                        onChange={updateSignMessage}
                    />
                </FormControl>
                <Button onClick={() => sign()} >Sign</Button>
            </>
        )
    }

    const updateSignMessage = (event: any) => {
        const hex = Buffer.from(event.target.value, "utf8").toString("hex");
        setSignMessage(hex);
    }

    const sign = async () => {
        if (state.imxSigner) {
            console.log(await state.imxSigner.signMessage(signMessage));
        }
    }

    return(
        <>
            {state.layer2address && renderSignForm() }
        </>
    )
}
