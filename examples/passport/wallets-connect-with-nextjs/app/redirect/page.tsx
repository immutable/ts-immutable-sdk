'use client';

import { useEffect } from 'react';
import { passportInstance } from '../utils/passport';
import { Heading } from '@biom3/react';

export default function Redirect() {
  useEffect(() => {
    // call the loginCallback function after the login is complete
    passportInstance.loginCallback();
  }, []);

  // render the view for the login popup after the login is complete
  return (
    <Heading>Logged in</Heading>
  );
}
