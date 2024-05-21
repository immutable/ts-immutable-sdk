'use client';

import { useEffect } from 'react';
import { passportInstance } from '../passport';

export default function Page() {
  useEffect(() => {
    if (!passportInstance) return;
    passportInstance.loginCallback();
  }, []);

  return (
    <div>Redirecting...</div>
  );
}
