import { Checkout } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import LoadingButton from './LoadingButton';
import { useEffect, useState } from 'react';
import { SuccessMessage, ErrorMessage } from './messages';
import { Box, FormControl, TextInput } from '@biom3/react';

interface CancelProps {
  checkout: Checkout;
  provider: Web3Provider | undefined;
}

export default function Cancel({ checkout, provider }: CancelProps) {
  const [orderId, setOrderId] = useState<string>('');
  const [orderIdError, setOrderIdError] = useState<any>(null);
  const [signActions, setSignActions] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function cancelClick() {
    if (!orderId) {
      setOrderIdError('Please enter an order ID');
      return;
    }
    if (!checkout) {
      console.error('missing checkout, please connect first');
      return;
    }
    if (!provider) {
      console.error('missing provider, please connect first');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await checkout.cancel({
        provider,
        orderIds: [orderId],
      });
      console.log('Cancel result', result);
      setLoading(false);
    } catch (err: any) {
      setError(err);
      setLoading(false);
      console.log(err.message);
      console.log(err.type);
      console.log(err.data);
      console.log(err.stack);
    }
  }

  const updateOrderId = (event: any) => {
    setOrderId(event.target.value);
    setOrderIdError('');
  }

  useEffect(() => {
    setError(null);
    setLoading(false);
  }, [checkout]);

  return (
    <Box>
      <FormControl validationStatus={orderIdError ? 'error' : 'success'} >
        <FormControl.Label>Order ID</FormControl.Label>
        <TextInput onChange={updateOrderId} />
        {orderIdError && (
          <FormControl.Validation>{orderIdError}</FormControl.Validation>
        )}
      </FormControl>
      <br />
      <LoadingButton onClick={cancelClick} loading={loading}>
        Cancel
      </LoadingButton>
      {!error && <SuccessMessage>Cancel success.</SuccessMessage>}
      {error && (
        <ErrorMessage>
          {error.message}. Check console logs for more details.
        </ErrorMessage>
      )}
    </Box>
  );
}
