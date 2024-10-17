import { Checkout } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { Box, FormControl, OptionKey, Select, Stack, TextInput } from '@biom3/react';
import React from 'react';
import LoadingButton from './LoadingButton';
import { ErrorMessage, SuccessMessage } from './messages';

enum WrapDirection {
  WRAP = 'wrap',
  UNWRAP = 'unwrap',
}

interface WrapProps {
  checkout: Checkout | undefined;
  provider: Web3Provider | undefined;
}

export const Wrap = ({ checkout, provider }: WrapProps) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [success, setSuccess] = React.useState<boolean>(false);
  const [error, setError] = React.useState<any>(null);

  const [direction, setDirection] = React.useState<WrapDirection>(WrapDirection.WRAP);
  const [amount, setAmount] = React.useState<string>('');
  const [transactionHash, setTransactionHash] = React.useState<string>('');

  const onUpdateDirection = (value: OptionKey) => {
    setDirection(value as WrapDirection);
  };

  const performWrap = async () => {
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
    setSuccess(false);

    const params = {
      provider,
      amount,
      direction,
    }

    try {
      const result = await checkout.wrapIMX(params);

      console.log('Wrap result:', result);

      setTransactionHash(result.transaction.hash);
      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setError(err);
      console.log(err.message);
      console.log(err.type);
      console.log(err.data);
      console.log(err.stack);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack direction="row" alignItems="center">
        <Stack>
          <FormControl>
            <FormControl.Label>Amount</FormControl.Label>
            <TextInput placeholder="0" onChange={(event) => setAmount(event.target.value)} />
          </FormControl>
        </Stack>
        <Stack>
          <FormControl>
            <FormControl.Label>Action</FormControl.Label>
            <Select onSelectChange={onUpdateDirection} selectedOption={direction}>
              <Select.Option optionKey={WrapDirection.WRAP}>
                <Select.Option.Label>Wrap</Select.Option.Label>
              </Select.Option>
              <Select.Option optionKey={WrapDirection.UNWRAP}>
                <Select.Option.Label>Unwrap</Select.Option.Label>
              </Select.Option>
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      <Box
        sx={{
          marginTop: 'base.spacing.x4',
        }}
      >
        <LoadingButton onClick={performWrap} loading={loading}>
          <Stack gap="base.spacing.x1" direction="row">
            Perform {direction}
          </Stack>
        </LoadingButton>
    </Box>

      {success && !error && (
        <SuccessMessage>
          Swap successful. Check console for details.
          {transactionHash && (
            <>
              Block explorer link:{' '}
                <a
                    href={`https://explorer.testnet.immutable.com/tx/${transactionHash}`}
                    target="_blank"
                    rel="noreferrer">{transactionHash}</a>
            </>
          )}
        </SuccessMessage>
      )}
      {error && (
        <ErrorMessage>
          {error.message}. Check console logs for more details.
        </ErrorMessage>
      )}
    </>
  );
};
