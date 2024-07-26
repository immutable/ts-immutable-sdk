'use client';

import { passportInstance } from '../utils';

export default function Redirect() {

  // call the loginCallback function after the login is complete
  passportInstance.loginCallback();

  // render the view for the login popup after the login is complete
  return (<h1>Logged in</h1>);
}
