import { useEffect } from 'react';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { silentLogoutParentUri } from '@/config';

export default function HandleCallback() {
  const { passportClient } = useImmutableProvider();

  useEffect(() => {
    passportClient?.logoutSilentCallback(silentLogoutParentUri);
  }, [passportClient]);
}
