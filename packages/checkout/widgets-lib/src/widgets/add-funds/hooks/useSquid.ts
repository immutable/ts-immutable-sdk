import { Squid } from '@0xsquid/sdk';
import { useEffect, useState } from 'react';

export const useSquid = () => {
  const [squid, setSquid] = useState<Squid | null>(null);

  useEffect(() => {
    if (squid) {
      return;
    }

    const initialiseSquid = async () => {
      const squidSDK = new Squid({
        baseUrl: 'https://apiplus.squidrouter.com',
        integratorId: 'immutable-bridge-f126614b-1683-471c-9e16-5df422c515cf',
      });

      await squidSDK.init();
      setSquid(squidSDK);
    };

    initialiseSquid();
  }, []);

  return squid;
};
