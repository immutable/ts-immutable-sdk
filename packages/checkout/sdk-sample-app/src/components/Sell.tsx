import { BuyToken, Checkout, ItemType, SellOrder, SellToken } from '@imtbl/checkout-sdk';
import LoadingButton from './LoadingButton';
import { useEffect, useState } from 'react';
import { SuccessMessage, ErrorMessage } from './messages';
import { Box, FormControl, Select, TextInput, OptionKey, Body } from '@biom3/react';
import { BrowserProvider } from 'ethers';

interface SellProps {
  checkout: Checkout;
  provider: BrowserProvider | undefined;
}

export default function Sell({ checkout, provider }: SellProps) {
  const [sellTokenType, setSellTokenType] = useState<ItemType|undefined>(undefined);
  const [sellTokenTypeError, setSellTokenTypeError] = useState<string>('');
  const [sellTokenId, setSellTokenId] = useState<string>('');
  const [sellTokenIdError, setSellTokenIdError] = useState<string>('');
  const [sellTokenContractAddress, setSellTokenContractAddress] = useState<string>('');
  const [sellTokenContractAddressError, setSellTokenContractAddressError] = useState<string>('');
  const [sellTokenAmount, setSellTokenAmount] = useState<string>('');
  const [sellTokenAmountError, setSellTokenAmountError] = useState<string>('');
  const [disableSellTokenAmount, setDisableSellTokenAmount] = useState<boolean>(true);
  const [buyTokenType, setBuyTokenType] = useState<ItemType|undefined>(undefined);
  const [buyTokenTypeError, setBuyTokenTypeError] = useState<string>('');
  const [buyTokenContractAddress, setBuyTokenContractAddress] = useState<string>('');
  const [buyTokenContractAddressError, setBuyTokenContractAddressError] = useState<string>('');
  const [disableBuyTokenContractAddress, setDisabledBuyTokenContractAddress] = useState<boolean>(true);
  const [buyTokenAmount, setBuyTokenAmount] = useState<string>('');
  const [buyTokenAmountError, setBuyTokenAmountError] = useState<string>('');
  const [expiry, setExpiry] = useState<string | undefined>(undefined);
  const [expiryError, setExpiryError] = useState<string>('');
  const [error, setError] = useState<any>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const isDateValid = (dateStr: string) => {
    var dateRegex = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})Z)?$/;
    return dateRegex.test(dateStr);
  }

  const getSellToken = (): SellToken => {
    if (sellTokenType === ItemType.ERC721) {
      return {
        type: ItemType.ERC721,
        id: sellTokenId,
        collectionAddress: sellTokenContractAddress,
      }
    } else if (sellTokenType === ItemType.ERC1155) {
      return {
        type: ItemType.ERC1155,
        id: sellTokenId,
        collectionAddress: sellTokenContractAddress,
        amount: sellTokenAmount,
      }
    }

    throw new Error('Invalid sell token type');
  }

  const getBuyToken = (): BuyToken => {
    if (buyTokenType === ItemType.NATIVE) {
      return {
        type: ItemType.NATIVE,
        amount: buyTokenAmount,
      }
    } else if (buyTokenType === ItemType.ERC20) {
      return {
        type: ItemType.ERC20,
        amount: buyTokenAmount,
        tokenAddress: buyTokenContractAddress,
      }
    }

    throw new Error('Invalid buy token type');
  }

  async function sellClick() {
    if (!sellTokenType) {
      setSellTokenTypeError('Please select the sell token type');
      return;
    }
    if (!sellTokenContractAddress) {
      setSellTokenContractAddressError(`Please enter the collection address for the ${sellTokenType}`);
      return;
    }
    if (!sellTokenId) {
      setSellTokenIdError('Please enter the ID of the ERC721 or ERC1155');
      return;
    }
    if (sellTokenType === ItemType.ERC1155 && !sellTokenAmount) {
      setSellTokenAmountError('Please enter the amount of ERC1155 tokens to sell');
      return;
    }
    if (!buyTokenType) {
      setBuyTokenTypeError('Please select the buy token type');
      return;
    }
    if (buyTokenType === ItemType.ERC20 && !buyTokenContractAddress) {
      setBuyTokenContractAddressError('Please enter the contract address for the ERC20');
      return;
    }
    if (!buyTokenAmount) {
      setBuyTokenAmountError(`Please enter the amount of ${buyTokenType} tokens to sell the ${sellTokenType} for`);
      return;
    }
    if (expiry && !isDateValid(expiry)) {
      setExpiryError('Invalid date - format YYYY-MM-DD or YYYY-MM-DDTHH:MM:SSZ');
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
        sellToken: getSellToken(),
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

  const updateSellTokenId = (event: any) => {
    setSellTokenId(event.target.value);
    setSellTokenIdError('');
  }

  const updateSellTokenContractAddress = (event: any) => {
    setSellTokenContractAddress(event.target.value);
    setSellTokenContractAddressError('');
  }

  const updateExpiry = (event: any) => {
    setExpiry(event.target.value);
    setError('');
  }

  const updateSellTokenAmount = (event: any) => {
    const value = event.target.value;
    setSellTokenAmount(value);
    setSellTokenAmountError('');
  }

  const updateBuyTokenAmount = (event: any) => {
    const value = event.target.value;
    setBuyTokenAmount(value);
    setBuyTokenAmountError('');
  }

  useEffect(() => {
    setError(null);
    setLoading(false);
  }, [checkout]);

  const selectSellToken = (value: OptionKey) => {
    switch (value) {
      case 'erc721':
        setSellTokenType(ItemType.ERC721);
        setSellTokenAmount('1');
        setDisableSellTokenAmount(true);
        setSellTokenTypeError('');
        break;
      case 'erc1155':
        setSellTokenType(ItemType.ERC1155);
        setDisableSellTokenAmount(false);
        setSellTokenTypeError('');
        break;
    }
  }

  const selectBuyToken = (value: OptionKey) => {
    switch (value) {
      case 'native':
        setBuyTokenType(ItemType.NATIVE);
        setDisabledBuyTokenContractAddress(true);
        setBuyTokenTypeError('');
        setBuyTokenContractAddress('');
        setBuyTokenContractAddressError('');
        break;
      case 'erc20':
        setBuyTokenType(ItemType.ERC20);
        setDisabledBuyTokenContractAddress(false);
        setBuyTokenTypeError('');
        break;
    }
  }

  const sellTokenForm = () => {
    return (
      <table>
        <thead>
          <tr>
            <th>Sell Token</th>
            <th>Contract Address</th>
            <th>ID</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <FormControl validationStatus={sellTokenTypeError ? 'error' : 'success'}>
                <Select
                  onSelectChange={selectSellToken}
                  defaultLabel='Select Sell Token'
                  validationStatus={sellTokenTypeError ? 'error' : 'success'}
                >
                  <Select.Option optionKey="erc721">
                    <Select.Option.Label>ERC721</Select.Option.Label>
                  </Select.Option>
                  <Select.Option optionKey="erc1155">
                    <Select.Option.Label>ERC1155</Select.Option.Label>
                  </Select.Option>
                </Select>
                {sellTokenTypeError && (
                  <FormControl.Validation>{sellTokenTypeError}</FormControl.Validation>
                )}
              </FormControl>
            </td>
            <td>
              <FormControl validationStatus={sellTokenContractAddressError ? 'error' : 'success'} >
                <TextInput onChange={updateSellTokenContractAddress} />
                {sellTokenContractAddressError && (
                  <FormControl.Validation>{sellTokenContractAddressError}</FormControl.Validation>
                )}
              </FormControl>
            </td>
            <td>
              <FormControl validationStatus={sellTokenIdError ? 'error' : 'success'} >
                <TextInput onChange={updateSellTokenId} />
                {sellTokenIdError && (
                  <FormControl.Validation>{sellTokenIdError}</FormControl.Validation>
                )}
              </FormControl>
            </td>
            <td>
              <FormControl>
                <TextInput
                  value={sellTokenAmount}
                  type='number'
                  disabled={disableSellTokenAmount}
                  onChange={updateSellTokenAmount}
                />
                {sellTokenAmountError && (
                  <FormControl.Validation>{sellTokenAmountError}</FormControl.Validation>
                )}
              </FormControl>
            </td>
          </tr>
        </tbody>
      </table>
    )
  }

  const buyTokenForm = () => {
    return (
      <table>
        <thead>
          <tr>
            <th>Buy Token</th>
            <th>Contract Address</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr key="form">
            <td>
              <FormControl validationStatus={buyTokenTypeError ? 'error' : 'success'}>
                <Select
                  onSelectChange={selectBuyToken}
                  defaultLabel='Select Buy Token'
                  validationStatus={buyTokenTypeError ? 'error' : 'success'}
                >
                  <Select.Option optionKey="native">
                    <Select.Option.Label>Native</Select.Option.Label>
                  </Select.Option>
                  <Select.Option optionKey="erc20">
                    <Select.Option.Label>ERC20</Select.Option.Label>
                  </Select.Option>
                </Select>
                {buyTokenTypeError && (
                  <FormControl.Validation>{buyTokenTypeError}</FormControl.Validation>
                )}
              </FormControl>
            </td>
            <td>
              <FormControl validationStatus={buyTokenContractAddressError ? 'error' : 'success'}>
                <TextInput
                  value={buyTokenContractAddress}
                  disabled={disableBuyTokenContractAddress}
                  onChange={(event: any) => {
                    setBuyTokenContractAddress(event.target.value);
                    setBuyTokenContractAddressError('');
                  }}
                />
              {buyTokenContractAddressError && (
                  <FormControl.Validation>{buyTokenContractAddressError}</FormControl.Validation>
                )}
              </FormControl>
            </td>
            <td>
              <FormControl validationStatus={buyTokenAmountError ? 'error' : 'success'}>
                <TextInput
                  value={buyTokenAmount}
                  type='number'
                  onChange={updateBuyTokenAmount}
                />
                {buyTokenAmountError && (
                  <FormControl.Validation>{buyTokenAmountError}</FormControl.Validation>
                )}
              </FormControl>
            </td>
          </tr>
        </tbody>
      </table>
    )
  }

  return (
    <Box>
      {sellTokenForm()}
      <br />
      {buyTokenForm()}
      <br />
      <table>
        <thead>
          <tr>
            <th>Expiry</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <FormControl validationStatus={expiryError ? 'error' : 'success'} >
                <TextInput onChange={updateExpiry} />
                {expiryError && (
                  <FormControl.Validation>{expiryError}</FormControl.Validation>
                )}
              </FormControl>
            </td>
          </tr>
        </tbody>
      </table>
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
