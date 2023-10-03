import { Checkout } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import LoadingButton from './LoadingButton';
import { useEffect, useState } from 'react';
import { SuccessMessage, ErrorMessage } from './messages';
import { Body, Box, FormControl, TextInput } from '@biom3/react';
import { Orderbook } from '@imtbl/orderbook';
import { Environment } from '@imtbl/config';

interface BuyProps {
  checkout: Checkout;
  provider: Web3Provider | undefined;
}

export default function Buy({ checkout, provider }: BuyProps) {
  const [orderId, setOrderId] = useState<string>('');
  const [orderIdError, setOrderIdError] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function buyClick() {
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
      const buyResult = await checkout.buy({
        provider,
        orders: [{id: orderId, takerFees: [{amount: {percentageDecimal: 0.01}, recipient: '0x96654086969DCaa88933E753Aa52d46EAB269Ff7'}]}],
      });
      console.log(buyResult);
      setLoading(false);
    } catch (err: any) {
      console.log(err);
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
      <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 'base.spacing.x2'}}>
      <LoadingButton onClick={buyClick} loading={loading}>
        Buy
      </LoadingButton>
      <Body size="xSmall">(adds 1% taker fee)</Body>
      </Box>
      {!error && <SuccessMessage>Buy success.</SuccessMessage>}
      {error && (
        <ErrorMessage>
          {error.message}. Check console logs for more details.
        </ErrorMessage>
      )}
    </Box>
  );
}
