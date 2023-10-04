import { Checkout } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import LoadingButton from './LoadingButton';
import { useEffect, useState } from 'react';
import { SuccessMessage, ErrorMessage } from './messages';
import { Body, Box, FormControl, TextInput } from '@biom3/react';
import { OrderStatus, Orderbook } from '@imtbl/orderbook';
import { Environment } from '@imtbl/config';

interface ListingsProps {
  checkout: Checkout;
  provider: Web3Provider | undefined;
}

export default function Listings({ checkout, provider }: ListingsProps) {
  const [sellContractAddress, setSellContractAddress] = useState<string>('');
  const [orderIdError, setAddressError] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function getListingsClick() {
    if (!sellContractAddress) {
      setAddressError('Please enter an collection address');
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
        const orderBook = new Orderbook({baseConfig: {environment: checkout.config.environment}})
        const listingsResult = await orderBook.listListings({
          sellItemContractAddress: sellContractAddress,
          status: OrderStatus.ACTIVE
        })
        console.log('listings:', listingsResult)
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

  const updateSellContractAddress = (event: any) => {
    setSellContractAddress(event.target.value);
    setAddressError('');
  }

  useEffect(() => {
    setError(null);
    setLoading(false);
  }, [checkout]);

  return (
    <Box>
      <FormControl validationStatus={orderIdError ? 'error' : 'success'} >
        <FormControl.Label>Sell Collection Address</FormControl.Label>
        <TextInput onChange={updateSellContractAddress} />
        {orderIdError && (
          <FormControl.Validation>{orderIdError}</FormControl.Validation>
        )}
      </FormControl>
      <br />
      <LoadingButton onClick={getListingsClick} loading={loading}>
        Get Listings
      </LoadingButton>
      {!error && <SuccessMessage>Get listings success. Check console for result</SuccessMessage>}
      {error && (
        <ErrorMessage>
          {error.message}. Check console logs for more details.
        </ErrorMessage>
      )}
    </Box>
  );
}
