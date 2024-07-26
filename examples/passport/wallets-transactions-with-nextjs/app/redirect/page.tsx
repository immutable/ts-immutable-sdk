'use client';

import { useEffect } from 'react';
import { passportInstance } from '@/src/utils';

export default function Redirect() {
  useEffect(() => {
    if (passportInstance) {
      // #doc passport-login-callback
      passportInstance.loginCallback();
      // #enddoc passport-login-callback
    }
  }, [passportInstance]);

  return (<h1>Redirecting...</h1>);
}
