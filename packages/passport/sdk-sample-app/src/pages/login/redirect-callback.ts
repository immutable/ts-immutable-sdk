import { useEffect, useState } from 'react';
import { useImmutableProvider } from '@/context/ImmutableProvider';

export default function HandleCallback() {
  const { passportClient } = useImmutableProvider();
  const [shouldCallCallback, setShouldCallCallback] = useState(false);

  useEffect(() => {
    if (!passportClient || !shouldCallCallback) {
      setTimeout(() => {
        setShouldCallCallback(true);
      }, 1000);
      return;
    }

    const handleCallback = async () => {
      await passportClient.loginCallback(true);
      window.location.href = window.location.origin;
    };

    handleCallback().catch(console.error);
  }, [passportClient, shouldCallCallback]);

  return null;
}
