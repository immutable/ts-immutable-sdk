import { Actions, AppCtx } from '../Context/app-context';
import {
  Box,
  Body,
  Button,
  FormControl,
  TextInput,
  Heading,
} from '@biom3/react';
import { ChangeEvent, useContext, useState } from 'react';
import { MetaMaskIMXProvider } from '@imtbl/sdk';

export const SignMessage = () => {
  const { state, dispatch } = useContext(AppCtx);
  const [signMessage, setSignMessage] = useState('');

  const renderSignForm = () => {
    return (
      <>
        <Heading size="medium">Sign a message</Heading>
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <FormControl>
            <TextInput onChange={updateSignMessage} />
          </FormControl>
          <Button onClick={() => sign()}>Sign</Button>
        </Box>
      </>
    );
  };

  const updateSignMessage = (event: ChangeEvent<HTMLInputElement>) => {
    const hex = Buffer.from(event.target.value, 'utf8').toString('hex');
    setSignMessage(hex);
  };

  const sign = async () => {
    const signedMessage = await MetaMaskIMXProvider.signMessage(signMessage);
    dispatch({
      payload: {
        type: Actions.MetaMaskIMXProviderSignMessage,
        signedMessage,
      },
    });
  };

  return (
    <Box sx={{ padding: 'base.spacing.x5' }}>
      {state.address && renderSignForm()}
      {state.signedMessage && (
        <Body>{`Signed message: ${state.signedMessage}`}</Body>
      )}
    </Box>
  );
};
