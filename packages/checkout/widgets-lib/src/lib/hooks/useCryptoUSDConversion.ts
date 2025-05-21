import { useState, useEffect } from 'react';
import { Environment } from '@imtbl/config';
import { getCryptoToUSDConversion } from '../../context/crypto-fiat-context/CryptoFiat';

export function useCryptoUSDConversion(environment: Environment | undefined) {
  const [conversions, setConversions] = useState<Map<string, number>>(new Map<string, number>());
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConversions() {
      if (!environment) return;

      try {
        const data = await getCryptoToUSDConversion(environment);
        setConversions(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(`Failed to fetch conversions: ${err}`));
      } finally {
        setLoading(false);
      }
    }

    fetchConversions();
    const interval = setInterval(fetchConversions, 30000);

    return () => clearInterval(interval);
  }, [environment]);

  return { conversions, error, loading };
}
