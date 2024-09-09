'use client';

import { useEffect } from 'react';
import { passportInstance } from '../utils/setupPassport';

export default function Redirect() {
  useEffect(() => {
    // call the loginCallback function after the login is complete
    passportInstance.loginCallback();
  }, []);

  // render the view for the login popup after the login is complete
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Logged in</h1>
    </div>
  );
}
