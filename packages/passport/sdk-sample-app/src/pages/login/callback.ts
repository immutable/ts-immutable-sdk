import { useEffect } from 'react';
import { useImmutableProvider } from '@/context/ImmutableProvider';

export default function HandleCallback() {
  const { passportClient } = useImmutableProvider();

  useEffect(() => {
    console.log('Login callback');
    passportClient.loginCallback(true);
  }, [passportClient]);
}
