import { useImmutableProvider } from '@/context/ImmutableProvider';
import { useEffect } from 'react';

export default function HandleCallback() {
  const { passportClient } = useImmutableProvider();

  useEffect(() => {
    console.log('emitting event to silently log user out');
    passportClient?.logoutSilentCallback('http://localhost:3000');
  }, [passportClient]);
}
