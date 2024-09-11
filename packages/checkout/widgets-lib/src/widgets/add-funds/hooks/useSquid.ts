import { Squid } from '@0xsquid/sdk';
import { useEffect, useState } from 'react';
import { SQUID_SDK_BASE_URL } from '../utils/config';

export const useSquid = () => {
  const [squid, setSquid] = useState<Squid | null>(null);

  useEffect(() => {
    if (squid) {
      return;
    }

    const initialiseSquid = async () => {
      const squidSDK = new Squid({
        baseUrl: SQUID_SDK_BASE_URL,
        integratorId: '',
      });

      await squidSDK.init();
      setSquid(squidSDK);
    };

    initialiseSquid();
  }, []);

  return squid;
};
