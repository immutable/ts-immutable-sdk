import { BuyToken, Checkout, ItemType, SellOrder } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import LoadingButton from './LoadingButton';
import { useEffect, useState } from 'react';
import { SuccessMessage, ErrorMessage } from './messages';
import { Box, FormControl, Select, TextInput, OptionKey, Body } from '@biom3/react';
import { utils } from 'ethers';
import { ERC20BuyToken } from '@imtbl/checkout-sdk/dist/types';

interface SellProps {
  checkout: Checkout;
  provider: Web3Provider | undefined;
}

export default function Sell({ checkout, provider }: SellProps) {
  const [id, setId] = useState<string>('');
  const [idError, setIdError] = useState<string>('');
  const [collectionAddress, setCollectionAddress] = useState<string>('');
  const [collectionAddressError, setCollectionAddressError] = useState<string>('');
  const [disableContractAddress, setDisabledContractAddress] = useState<boolean>(true);
  const [listingType, setListingType] = useState<ItemType|undefined>(undefined);
  const [listingTypeError, setListingTypeError] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');
  const [expiry, setExpiry] = useState<string | undefined>(undefined);
  const [expiryError, setExpiryError] = useState<string>('');
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [contractAddressError, setContractAddressError] = useState<string>('');
  const [error, setError] = useState<any>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const isDateValid = (dateStr: string) => {
    var dateRegex = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})Z)?$/;
    return dateRegex.test(dateStr);
  }

  const getBuyToken = (): BuyToken => {
    if (listingType === ItemType.NATIVE) {
      return {
        type: ItemType.NATIVE,
        amount,
      }
    }
    return {
      type: ItemType.ERC20,
      amount,
      tokenAddress,
    };
  }

  async function sellClick() {
    if (!id) {
      setIdError('Please enter the ID of the ERC721');
      return
    }
    if (!collectionAddress) {
      setCollectionAddressError('Please enter the collection address for the ERC721');
      return
    }
    if (!listingType) {
      setListingTypeError('Please select the listing type');
      return
    }
    if (listingType === ItemType.NATIVE && !amount) {
      setAmountError('Please enter the amount of NATIVE tokens to sell the ERC721 for');
      return
    }
    if (listingType === ItemType.ERC20 && !amount) {
      setAmountError('Please enter the amount of ERC20 tokens to sell the ERC721 for');
      return
    }
    if (listingType === ItemType.ERC20 && !tokenAddress) {
      setContractAddressError('Please enter the contract address for the ERC20');
      return
    }
    if (expiry && !isDateValid(expiry)) {
      setExpiryError('Invalid date - format YYYY-MM-DD or YYYY-MM-DDTHH:MM:SSZ');
      return
    }
    if (!id ||
      !collectionAddress ||
      !amount ||
      !listingType ||
      (listingType === ItemType.ERC20 && !tokenAddress)) {
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

      const orders:Array<SellOrder> = [{
        sellToken: {
          id,
          collectionAddress
        },
        buyToken: getBuyToken(),
        makerFees: [{
          amount: { percentageDecimal: 0.025 },
          recipient: '0xEac347177DbA4a190B632C7d9b8da2AbfF57c772'
        }],
        orderExpiry: expiry ? new Date(expiry) : undefined
      }]

      const result = await checkout.sell({
        provider,
        orders,
      });
      console.log('Sell result', result);
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

  const updateId = (event: any) => {
    setId(event.target.value);
    setIdError('');
  }

  const updateCollectionAddress = (event: any) => {
    setCollectionAddress(event.target.value);
    setCollectionAddressError('');
  }

  const updateExpiry = (event: any) => {
    setExpiry(event.target.value);
    setError('');
  }

  const updateAmount = (event: any) => {
    const value = event.target.value;
    setAmount(value);
    setAmountError('');
  }

  useEffect(() => {
    setError(null);
    setLoading(false);
  }, [checkout]);

  const selectListingToken = (value: OptionKey) => {
    switch (value) {
      case 'native':
        setListingType(ItemType.NATIVE);
        setDisabledContractAddress(true);
        setListingTypeError('');
        setTokenAddress('');
        setContractAddressError('');
        break;
      case 'erc20':
        setListingType(ItemType.ERC20);
        setDisabledContractAddress(false);
        setListingTypeError('');
        break;
    }
  }

  const tokenForm = () => {
    return (
      <table>
        <thead>
          <tr>
            <th>Listing Token</th>
            <th>Amount</th>
            {listingType === ItemType.ERC20 && <th>Contract Address</th>}
          </tr>
        </thead>
        <tbody>
          <tr key="form">
            <td>
              <FormControl validationStatus={listingTypeError ? 'error' : 'success'}>
                <Select
                  onSelectChange={selectListingToken}
                  defaultLabel='Select Listing Token'
                  validationStatus={listingTypeError ? 'error' : 'success'}
                >
                  <Select.Option optionKey="native">
                    <Select.Option.Label>Native</Select.Option.Label>
                  </Select.Option>
                  <Select.Option optionKey="erc20">
                    <Select.Option.Label>ERC20</Select.Option.Label>
                  </Select.Option>
                </Select>
                {listingTypeError && (
                  <FormControl.Validation>{listingTypeError}</FormControl.Validation>
                )}
              </FormControl>
            </td>
            <td>
              <FormControl validationStatus={amountError ? 'error' : 'success'}>
                <TextInput
                  value={amount}
                  type='number'
                  onChange={updateAmount}
                />
                {amountError && (
                  <FormControl.Validation>{amountError}</FormControl.Validation>
                )}
              </FormControl>
            </td>
            {listingType === ItemType.ERC20 && <td>
              <FormControl validationStatus={contractAddressError ? 'error' : 'success'}>
                <TextInput
                  value={tokenAddress}
                  disabled={disableContractAddress}
                  onChange={(event: any) => {
                    setTokenAddress(event.target.value);
                    setContractAddressError('');
                  }}
                />
              {contractAddressError && (
                  <FormControl.Validation>{contractAddressError}</FormControl.Validation>
                )}
              </FormControl>
            </td>}
          </tr>
        </tbody>
      </table>
    )
  }

  return (
    <Box>
      <FormControl validationStatus={idError ? 'error' : 'success'} >
        <FormControl.Label>ERC721 ID</FormControl.Label>
        <TextInput onChange={updateId} />
        {idError && (
          <FormControl.Validation>{idError}</FormControl.Validation>
        )}
      </FormControl>
      <FormControl validationStatus={collectionAddressError ? 'error' : 'success'} >
        <FormControl.Label>Collection Address</FormControl.Label>
        <TextInput onChange={updateCollectionAddress} />
        {collectionAddressError && (
          <FormControl.Validation>{collectionAddressError}</FormControl.Validation>
        )}
      </FormControl>
      <FormControl validationStatus={expiryError ? 'error' : 'success'} >
        <FormControl.Label>Expiry</FormControl.Label>
        <TextInput onChange={updateExpiry} />
        {expiryError && (
          <FormControl.Validation>{expiryError}</FormControl.Validation>
        )}
      </FormControl>
      {tokenForm()}
      <br />
      <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 'base.spacing.x2'}}>
        <LoadingButton onClick={sellClick} loading={loading}>
          Sell
        </LoadingButton>
        <Body size="xSmall">(adds 2.5% maker fee)</Body>
      </Box>
      {(!error && success) && <SuccessMessage>Sell success.</SuccessMessage>}
      {error && (
        <ErrorMessage>
          {error.message}. Check console logs for more details.
        </ErrorMessage>
      )}
    </Box>
  );
}
