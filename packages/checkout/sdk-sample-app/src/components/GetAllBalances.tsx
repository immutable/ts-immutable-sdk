import { ChainId, Checkout, GetBalanceResult, WrappedBrowserProvider } from '@imtbl/checkout-sdk';
import LoadingButton from './LoadingButton';
import { useEffect, useState } from 'react';
import { SuccessMessage, ErrorMessage, WarningMessage } from './messages';
import { Box } from '@biom3/react';

interface BalanceProps {
  checkout: Checkout | undefined;
  provider: WrappedBrowserProvider | undefined;
}

export default function GetAllBalances(props: BalanceProps) {
  const { provider, checkout } = props;

  const [result, setResult] = useState<GetBalanceResult[]>();
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function getAllBalances() {
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

    const walletAddress = await (await provider.getSigner()).getAddress();
    try {
      const resp = await checkout.getAllBalances({
        provider,
        walletAddress,
        chainId: Number((await provider.getNetwork()).chainId),
      });
      setResult(resp.balances);
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
    setResult(undefined);
    setError(null);
    setLoading(false);
  }, [checkout]);

  return (
    <div>
      {!provider && <WarningMessage>Not connected.</WarningMessage>}
      <Box
        sx={{
          marginTop: 'base.spacing.x4',
        }}
      >
        <LoadingButton onClick={getAllBalances} loading={loading}>
          Get all balances (Current Network)
        </LoadingButton>
      </Box>
      {result && !error && (
        <SuccessMessage>
          {result?.map((balance) => (
            <div key={balance.token.symbol}>
              <Box>{balance.token.symbol + ' ' + balance.formattedBalance}</Box>
            </div>
          ))}
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
