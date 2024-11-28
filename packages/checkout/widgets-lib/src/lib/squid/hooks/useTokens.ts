import { Checkout, SquidConfig } from '@imtbl/checkout-sdk';
import { useCallback, useEffect, useState } from 'react';
import { fetchTokens } from '../fetchTokens';
import { Token } from '../types';

export const useTokens = (checkout: Checkout) => {
  const [tokens, setTokens] = useState<Token[] | null>(null);

  const squidConfig = useCallback(async (): Promise<
  SquidConfig | undefined
  > => {
    try {
      return (await checkout?.config?.remote.getConfig('squid')) as SquidConfig;
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Unable to fetch squid config: ', err);
    }
    return undefined;
  }, [checkout]);

  useEffect(() => {
    if (tokens) {
      return;
    }

    const getTokens = async () => {
      const config = await squidConfig();

      if (!config?.integratorId) return;
      try {
        const tokensResponse = await fetchTokens(config.integratorId);
        setTokens(tokensResponse);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error fetching tokens', e);
      }
    };
    getTokens();
  }, [squidConfig]);

  return tokens;
};
