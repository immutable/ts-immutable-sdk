import { Checkout, ConnectionProviders, NetworkInfo } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import LoadingButton from './LoadingButton';
import { useEffect, useMemo, useState } from 'react';
import { SuccessMessage, ErrorMessage } from './messages';
import { Environment } from '@imtbl/config';

interface ConnectProps {
  checkout: Checkout  | undefined;
}

export default function Connect(props: ConnectProps) {
  const { checkout } = props;

  const [result, setResult] = useState<NetworkInfo>();
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function connectClick() {
    if(!checkout) {
      console.error('missing checkout, create provider and connect first')
      return;
    } 

    setError(null);
    setLoading(true);
    try {
      const resp = await checkout.connect();
      setResult(resp.network);
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
      <LoadingButton onClick={connectClick} loading={loading}>
        Connect
      </LoadingButton>
      {result && !error && <SuccessMessage>Connected.</SuccessMessage>}
      {error && (
        <ErrorMessage>
          {error.message}. Check console logs for more details.
        </ErrorMessage>
      )}
    </div>
  );
}
