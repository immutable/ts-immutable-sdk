'use client';

import { Web3Provider } from '@ethersproject/providers';
import { config, passport } from '@imtbl/sdk';
import { useEffect } from 'react';


export default function Logout() {

  return (<>
  <h1>Logged out</h1>
    <a href="/">Return to Examples</a>
  </>);

}
