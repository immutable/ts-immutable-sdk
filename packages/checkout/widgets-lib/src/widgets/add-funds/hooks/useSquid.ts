import { Squid } from '@0xsquid/sdk';
import { useEffect, useState } from 'react';

export const useSquid = () => {
  const [squid, setSquid] = useState<Squid | null>(null);

  useEffect(() => {
    if (squid) {
      return;
    }

    const initialiseSquid = async () => {
      const squidSDK = null;

      setSquid(squidSDK);
    };

    initialiseSquid();
  }, []);

  return squid;
};
