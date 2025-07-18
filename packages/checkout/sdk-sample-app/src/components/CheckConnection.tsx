import { useEffect, useState } from 'react';
import LoadingButton from './LoadingButton';
import { SuccessMessage, ErrorMessage, WarningMessage } from './messages';
import { Box } from '@biom3/react';
import { CheckConnectionResult, Checkout, WrappedBrowserProvider } from '@imtbl/checkout-sdk';

interface CheckConnectionProps {
  checkout: Checkout | undefined;
  provider: WrappedBrowserProvider | undefined;
}

export default function CheckConnection(props: CheckConnectionProps) {
  const { provider, checkout } = props;

  const [result, setResult] = useState<CheckConnectionResult>();
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function checkMyConnection() {
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
      const resp = await checkout.checkIsWalletConnected({
        provider,
      });
      console.log('Connection result', resp);
      setResult(resp);
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
    // reset state wehn checkout changes from environment switch
    setResult(undefined);
    setError(null);
    setLoading(false);
  }, [checkout]);

  return (
    <div>
      {!provider || !result?.isConnected && (
        <WarningMessage>Not connected.</WarningMessage>
      )}
      <Box
        sx={{
          marginTop: 'base.spacing.x4',
        }}
      >
        <LoadingButton onClick={checkMyConnection} loading={loading}>
          Check
        </LoadingButton>
      </Box>
      {!error && result?.isConnected && (
        <SuccessMessage>
          Connected with wallet address <b>{result.walletAddress}</b>.
        </SuccessMessage>
      )}
      {error && (
        <ErrorMessage>
          {error.message}. Check console logs for more details.
        </ErrorMessage>
      )}
    </div>
  );
}
