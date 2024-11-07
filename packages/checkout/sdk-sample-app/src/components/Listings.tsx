import { Checkout } from '@imtbl/checkout-sdk';
import LoadingButton from './LoadingButton';
import { useEffect, useState } from 'react';
import { SuccessMessage, ErrorMessage } from './messages';
import { Body, Box, FormControl, TextInput } from '@biom3/react';
import { OrderStatusName, Orderbook } from '@imtbl/orderbook';
import { Environment } from '@imtbl/config';
import { BrowserProvider } from 'ethers';

interface ListingsProps {
  checkout: Checkout;
  provider: BrowserProvider | undefined;
}

export default function Listings({ checkout, provider }: ListingsProps) {
  const [sellContractAddress, setSellContractAddress] = useState<string>('');
  const [orderIdError, setAddressError] = useState<any>(null);

  const [listingId, setListingId] = useState<string>('');
  const [listingIdError, setListingIdError] = useState<any>(null);
  
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function getListingsClick() {
    if (!sellContractAddress && !listingId) {
      setAddressError('Please enter an collection address');
      setListingIdError('Or enter an collection address');
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

      if (listingId) {
        const result = await orderBook.getListing(listingId)
        console.log('listings:', result)
      } else {
        const result = await orderBook.listListings({
          sellItemContractAddress: sellContractAddress,
          status: OrderStatusName.ACTIVE
        })
        console.log('listings:', result)
      }
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
    setListingIdError('');
  }

  const updateListingId = (event: any) => {
    setListingId(event.target.value);
    setAddressError('');
    setListingIdError('');
  }

  useEffect(() => {
    setError(null);
    setLoading(false);
  }, [checkout]);

  return (
    <Box>
      <FormControl validationStatus={orderIdError ? 'error' : 'success'} >
        <FormControl.Label>Collection Address</FormControl.Label>
        <TextInput onChange={updateSellContractAddress} />
        {orderIdError && (
          <FormControl.Validation>{orderIdError}</FormControl.Validation>
        )}
      </FormControl>
      <br />
      <FormControl validationStatus={orderIdError ? 'error' : 'success'} >
        <FormControl.Label>Listing Id (optional)</FormControl.Label>
        <TextInput onChange={updateListingId} />
        {listingIdError && (
          <FormControl.Validation>{listingIdError}</FormControl.Validation>
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
