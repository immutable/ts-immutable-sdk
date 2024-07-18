'use client';
 
import { Web3Provider } from '@ethersproject/providers';
import { config, passport } from '@imtbl/sdk';

export default function Home() {

  const passportInstance = new passport.Passport({
    baseConfig: {
      environment: config.Environment.SANDBOX,
      publishableKey: process.env.PUBLISHABLE_KEY ?? "", // replace with your publishable API key from Hub
    },
    clientId: process.env.CLIENT_ID ?? "", // replace with your client ID from Hub
    redirectUri: 'http://localhost:3000/redirect', // replace with one of your redirect URIs from Hub
    logoutRedirectUri: 'http://localhost:3000/logout', // replace with one of your logout URIs from Hub
    audience: 'platform_api',
    scope: 'openid offline_access email transact',
    popupOverlayOptions: {
      disableGenericPopupOverlay: false, // Set to true to disable the generic pop-up overlay
      disableBlockedPopupOverlay: false, // Set to true to disable the blocked pop-up overlay
    }
  });

  passportInstance.loginCallback();

  const passportProvider = passportInstance.connectEvm();

  console.log('passportInstance', passportInstance)

  const web3Provider = new Web3Provider(passportProvider);

  (async () => {
    if (!web3Provider.provider.request) return;
      const accounts = await web3Provider.provider.request({ method: "eth_requestAccounts" });
      const signer = web3Provider.getSigner();

      console.log('accounts', accounts);
      console.log('signer', signer);
  })()


  return (<></>);
}
