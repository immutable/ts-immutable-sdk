import { useImmutableProvider } from '@/context/ImmutableProvider';
import { useEffect } from 'react';
import { silentLogoutParentUri } from '@/config';

export default function HandleCallback() {
  const { passportClient } = useImmutableProvider();

  useEffect(() => {
    console.log('emitting event to silently log user out');
    passportClient?.logoutSilentCallback(silentLogoutParentUri);
  }, [passportClient]);
}
