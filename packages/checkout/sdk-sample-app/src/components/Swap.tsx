import { ChainId, Checkout, GetBalanceResult, TokenInfo } from '@imtbl/checkout-sdk';
import LoadingButton from './LoadingButton';
import { useEffect, useState } from 'react';
import { SuccessMessage, ErrorMessage, WarningMessage } from './messages';
import { Box, FormControl, TextInput } from '@biom3/react';
import React from 'react';
import { BrowserProvider } from 'ethers';

interface SwapProps {
  checkout: Checkout | undefined;
  provider: BrowserProvider | undefined;
}

export default function Swap(props: SwapProps) {
  const { provider, checkout } = props;

  const [fromToken, setFromToken] = useState<TokenInfo | undefined>();
  const [toToken, setToToken] = useState<TokenInfo | undefined>();
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [slippagePercent, setSlippagePercent] = useState<string>('0.1');
  const [maxHops, setMaxHops] = useState<string>('2');
  const [deadline, setDeadline] = useState<string>(() => {
    const fifteenMinutesInSeconds = 15 * 60;
    return Math.floor(Date.now() / 1000 + fifteenMinutesInSeconds).toString();
  });

  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [fromTokenDecimals, setFromTokenDecimals] = useState<number>(18);
  const [toTokenDecimals, setToTokenDecimals] = useState<number>(18);

  const updateFromToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFromToken({ address: event.target.value, symbol: '', name: '', decimals: fromTokenDecimals });
    setError(null);
  };

  const updateToToken = (event: React.ChangeEvent<HTMLInputElement>) => {
    setToToken({ address: event.target.value, symbol: '', name: '', decimals: toTokenDecimals });
    setError(null);
  };

  const updateFromTokenDecimals = (event: React.ChangeEvent<HTMLInputElement>) => {
    const decimals = parseInt(event.target.value) || 18;
    setFromTokenDecimals(decimals);
    setFromToken(prevToken => prevToken ? { ...prevToken, decimals } : undefined);
    setError(null);
  };

  const updateToTokenDecimals = (event: React.ChangeEvent<HTMLInputElement>) => {
    const decimals = parseInt(event.target.value) || 18;
    setToTokenDecimals(decimals);
    setToToken(prevToken => prevToken ? { ...prevToken, decimals } : undefined);
    setError(null);
  };

  const updateFromAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFromAmount = event.target.value;
    setFromAmount(newFromAmount);
    setError(null);
    validateAmounts(newFromAmount, toAmount);
  };

  const updateToAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newToAmount = event.target.value;
    setToAmount(newToAmount);
    setError(null);
    validateAmounts(fromAmount, newToAmount);
  };

  const validateAmounts = (from: string, to: string) => {
    if (from !== '' && to !== '') {
      setValidationError('Please provide either From Amount or To Amount, not both.');
    } else {
      setValidationError(null);
    }
  };

  const updateSlippagePercent = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSlippagePercent(event.target.value);
    setError(null);
  };

  const updateMaxHops = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaxHops(event.target.value);
    setError(null);
  };

  const updateDeadline = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDeadline(event.target.value);
    setError(null);
  };

  async function performSwap() {
    if (validationError) {
      setError(new Error(validationError));
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
    if (!fromToken || !toToken) {
      console.error('missing token information');
      return;
    }
    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      const result = await checkout.swap({
        provider,
        fromToken,
        toToken,
        fromAmount,
        toAmount,
        slippagePercent: slippagePercent.trim() !== '' ? parseFloat(slippagePercent) : undefined,
        maxHops: maxHops.trim() !== '' ? parseInt(maxHops) : undefined,
        deadline: deadline.trim() !== '' ? parseInt(deadline) : undefined,
      });
      console.log('Swap result:', result);
      setSuccess(true);
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

  useEffect(() => {
    setError(null);
    setLoading(false);
    setSuccess(false);
  }, [checkout]);

  return (
    <div>
      {!provider && <WarningMessage>Not connected.</WarningMessage>}
      <Box>
      <table>
        <thead>
          <tr>
            <th>From Token Address</th>
            <th>Decimals</th>
            <th>To Token Address</th>
            <th>Decimals</th>
          </tr>
        </thead>
      <tbody>
          <tr>
            <td>
                <FormControl>
                <TextInput name="fromToken"  onChange={updateFromToken} />
                </FormControl>
            </td>
            <td>
                <FormControl >
                <TextInput name="fromTokenDecimals" placeholder="18" onChange={updateFromTokenDecimals} />
                </FormControl>
            </td>
            <td>
                <FormControl>
                <TextInput name="toToken"  onChange={updateToToken} />
                </FormControl>
            </td>
            <td>
                <FormControl>
                <TextInput name="toTokenDecimals"  placeholder="18" onChange={updateToTokenDecimals} />
                </FormControl>
            </td>
          </tr>
        </tbody>
      </table>
        <FormControl>
          <FormControl.Label>From Amount</FormControl.Label>
          <TextInput onChange={updateFromAmount} value={fromAmount} />
        </FormControl>
        <FormControl>
          <FormControl.Label>To Amount</FormControl.Label>
          <TextInput onChange={updateToAmount} value={toAmount} />
        </FormControl>
        {validationError && <ErrorMessage>{validationError}</ErrorMessage>}
        <FormControl>
          <FormControl.Label>Slippage Percent</FormControl.Label>
          <TextInput value={slippagePercent} onChange={updateSlippagePercent} />
        </FormControl>
        <FormControl>
          <FormControl.Label>Max Hops</FormControl.Label>
          <TextInput value={maxHops} onChange={updateMaxHops} />
        </FormControl>
        <FormControl>
          <FormControl.Label>Deadline (minutes)</FormControl.Label>
          <TextInput value={deadline} onChange={updateDeadline} />
        </FormControl>
        <Box
          sx={{
            marginTop: 'base.spacing.x4',
          }}
        >
          <LoadingButton onClick={performSwap} loading={loading}>
            Swap
          </LoadingButton>
        </Box>
        {success && !error && (
          <SuccessMessage>Swap successful. Check console for details.</SuccessMessage>
        )}
        {error && (
          <ErrorMessage>
            {error.message}. Check console logs for more details.
          </ErrorMessage>
        )}
      </Box>
    </div>
  );
}