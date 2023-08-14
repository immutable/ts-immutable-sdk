import { Checkout } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import LoadingButton from './LoadingButton';
import { useEffect, useState } from 'react';
import { SuccessMessage, ErrorMessage } from './messages';

interface BuyProps {
  checkout: Checkout;
  provider: Web3Provider | undefined;
}

export default function Buy(props: BuyProps) {
  const { checkout, provider } = props;

  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  async function buyClick() {
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
      await checkout.buy({
        provider,
        orderId: '0189d7cc-5bf6-94b2-29ab-af73aa8ab24d',
      });
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
  }, [checkout]);

  return (
    <div>
      <LoadingButton onClick={buyClick} loading={loading}>
        Buy
      </LoadingButton>
      {!error && <SuccessMessage>Buy success.</SuccessMessage>}
      {error && (
        <ErrorMessage>
          {error.message}. Check console logs for more details.
        </ErrorMessage>
      )}
    </div>
  );
}
