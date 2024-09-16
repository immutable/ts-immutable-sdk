import { Squid } from '@0xsquid/sdk';
import { Checkout, SquidConfig } from '@imtbl/checkout-sdk';
import { useCallback, useEffect, useState } from 'react';
import { SQUID_SDK_BASE_URL } from '../utils/config';

export const useSquid = (checkout: Checkout) => {
  const [squid, setSquid] = useState<Squid | null>(null);

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
    if (squid || !squidConfig) {
      return;
    }
    const initialiseSquid = async () => {
      const config = await squidConfig();

      if (!config?.integratorId) return;

      const squidSDK = new Squid({
        baseUrl: SQUID_SDK_BASE_URL,
        integratorId: config.integratorId,
      });

      await squidSDK.init();
      setSquid(squidSDK);
    };

    initialiseSquid();
  }, [squidConfig]);

  return squid;
};
