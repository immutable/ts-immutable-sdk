import { AppCtx } from '../Context/app-context';
import {
  Box,
  Button,
  FormControl,
  TextInput,
  Heading,
} from '@biom3/react';
import { ChangeEvent, useContext, useState } from 'react';

export const CreateTrade = () => {
  const { state } = useContext(AppCtx);
  const [orderId, setorderId] = useState<undefined | number>(undefined);

  const createTrade = async () => {
    if (!orderId) {
      alert('missing requirements')
      return;
    }

    await state.metaMaskIMXProvider?.createTrade({ order_id: orderId, user: state.address })
  };

  const renderCreateTrade = () => {
    const updateOrderId = (event: ChangeEvent<HTMLInputElement>) => {
      setorderId(parseInt(event.target.value))
    };
    
    return (
      <>
        <Heading size="medium">Create a trade</Heading>
        <Box sx={{ mb: 'base.spacing.x4' }}>
          <FormControl sx={{ mb: 'base.spacing.x2' }}>
            <FormControl.Label>Order ID:</FormControl.Label>
            <TextInput onChange={updateOrderId} />
          </FormControl>
        </Box>
        <Button onClick={() => createTrade()}>Trade</Button>
      </>
    );
  };

  return (
    <Box sx={{ padding: 'base.spacing.x5' }}>
      {state.address && renderCreateTrade()}
    </Box>
  );
};
