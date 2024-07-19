'use client';

import { Web3Provider } from '@ethersproject/providers';
import { config, passport } from '@imtbl/sdk';
import { useEffect } from 'react';
import { passportInstance } from '../page';



export default function Redirect() {

  passportInstance.loginCallback();

  return (<h1>Redirect</h1>);
}
