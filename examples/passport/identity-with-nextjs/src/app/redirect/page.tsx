'use client';

import { usePassport } from '@/context/passport';
import { useEffect } from 'react';

export default function Redirect() {
  const { passportInstance } = usePassport();

  useEffect(() => {
    if (passportInstance) {
      // #doc passport-login-callback
      passportInstance.loginCallback();
      // #enddoc passport-login-callback
    }
  }, [passportInstance]);

  // render the view for the login popup after the login is complete
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Logged in</h1>
    </div>
  );
}
