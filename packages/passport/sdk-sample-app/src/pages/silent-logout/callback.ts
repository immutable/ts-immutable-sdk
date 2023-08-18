import { useImmutableProvider } from '@/context/ImmutableProvider';
import { useEffect } from 'react';
import { silentLogoutParentUri } from '@/config';

export default function HandleCallback() {
  const { passportClient } = useImmutableProvider();

  useEffect(() => {
    passportClient?.logoutSilentCallback(silentLogoutParentUri);
  }, [passportClient]);
}
