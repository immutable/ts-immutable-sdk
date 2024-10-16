'use client'

import React from 'react';
import Home from './Home';
import { passport } from '@imtbl/sdk';
import { Environment, ImmutableConfiguration } from '@imtbl/sdk/config';

export const passportInstance = new passport.Passport({
  baseConfig: new ImmutableConfiguration({ environment: Environment.SANDBOX }),
	clientId: process.env.NEXT_PUBLIC_CLIENT_ID || '',
	redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI || '',
	logoutRedirectUri: process.env.NEXT_PUBLIC_LOGOUT_REDIRECT_URI || '',
	audience: "platform_api",
	scope: "openid offline_access email transact",
	crossSdkBridgeEnabled: true,
});

export default function App() {
  return (<Home />)
};
