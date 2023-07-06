import { useEffect } from 'react';
import { useImmutableProvider } from '@/context/ImmutableProvider';

export default function HandleCallback() {
  const { passportClient } = useImmutableProvider();

  useEffect(() => {
    passportClient?.loginCallback();
  }, [passportClient]);
}
