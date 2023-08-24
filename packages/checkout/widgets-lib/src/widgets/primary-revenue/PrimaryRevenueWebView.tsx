import { useEffect } from 'react';
import { Environment } from '@imtbl/config';
import { config, passport } from '@imtbl/sdk';

import { WidgetTheme } from '../../lib';
import { ImmutableWebComponent } from '../ImmutableWebComponent';

const passportlink =  "http://localhost:3001/primary-revenue?clientId=XuGsHvMqMJrb73diq1fCswWwn4AYhcM6&redirectUri=http://localhost:3001/primary-revenue&logoutRedirectUri=http://localhost:3001/primary-revenue&audience=platform_api&scope=openid%20offline_access%20email%20transact&environment=sandbox"; // eslint-disable-line

const useParams = () => {
  const urlParams = new URLSearchParams(window.location.search);

  const login = urlParams.get('login') as string;
  const clientId = urlParams.get('clientId') as string;
  const redirectUri = urlParams.get('redirectUri') as string;
  const logoutRedirectUri = urlParams.get('logoutRedirectUri') as string;
  const audience = urlParams.get('audience') as string;
  const scope = urlParams.get('scope') as string;
  const environment = {
    sandbox: config.Environment.SANDBOX,
    production: config.Environment.PRODUCTION,
  }[urlParams.get('environment') || 'sandbox'];
  const amount = urlParams.get('amount') as string;
  const fromContractAddress = urlParams.get('fromContractAddress') as string;

  return {
    login,
    clientId,
    redirectUri,
    logoutRedirectUri,
    audience,
    scope,
    environment,
    amount,
    fromContractAddress,
  };
};

const usePassportInstance = () => {
  const {
    clientId,
    redirectUri,
    logoutRedirectUri,
    audience,
    scope,
    environment,
  } = useParams();

  if (!clientId || !redirectUri || !logoutRedirectUri || !audience || !scope) {
    return null;
  }

  const passportInstance = new passport.Passport({
    baseConfig: new config.ImmutableConfiguration({
      environment: environment || config.Environment.SANDBOX,
    }),
    clientId,
    redirectUri,
    logoutRedirectUri,
    audience,
    scope,
  });

  return passportInstance;
};

function PrimaryRevenueWebView() {
  const params = useParams();
  const { login, amount, fromContractAddress } = params;

  useEffect(() => {
    const passportInstance = usePassportInstance();
    if (!passportInstance) return;

    const primaryRevenueElement = document.querySelector<ImmutableWebComponent>(
      'imtbl-primary-revenue',
    );
    primaryRevenueElement?.addPassportOption(passportInstance as any);

    if (login) {
      passportInstance.loginCallback();
    }
  }, [login]);

  const handleRedirect = (withPassport: boolean) => (e: any) => {
    e.preventDefault();
    const origin = new URL(window.location.href);
    const destination = new URL(passportlink);

    destination.searchParams.forEach((value, key) => {
      if (withPassport) {
        origin.searchParams.set(key, value);
      } else {
        origin.searchParams.delete(key);
      }
    });

    window.location.href = origin.toString();
  };

  const widgetConfig = {
    theme: WidgetTheme.LIGHT,
    environment: Environment.SANDBOX,
  };

  return (
    <>
      <imtbl-primary-revenue
        widgetConfig={JSON.stringify(widgetConfig)}
        amount={amount}
        fromContractAddress={fromContractAddress}
      />
      <br />
      <h1>
        <a href="#" onClick={handleRedirect(true)}>
          Passport On
        </a>
      </h1>
      <br />
      <h1>
        <a href="#" onClick={handleRedirect(false)}>
          Passport Off
        </a>
      </h1>
    </>
  );
}

export default PrimaryRevenueWebView;
