import { useImmutableProvider } from '@/context/ImmutableProvider';
import { useEffect } from 'react';
import { SILENT_LOGOUT_PARENT_URI } from '@/config';

export default function HandleCallback() {
  const { passportClient } = useImmutableProvider();

  useEffect(() => {
    passportClient.logoutSilentCallback(SILENT_LOGOUT_PARENT_URI);
  }, [passportClient]);
}
