import { useEffect } from 'react';
import { Environment } from '@imtbl/config';
import { config, passport } from '@imtbl/sdk';

import { WidgetTheme } from '../../lib';
import { ImmutableWebComponent } from '../ImmutableWebComponent';

const usePassportInstance = () => {
  const urlParams = new URLSearchParams(window.location.search);

  const clientId = urlParams.get('clientId') as string;
  const redirectUri = urlParams.get('redirectUri') as string;
  const logoutRedirectUri = urlParams.get('logoutRedirectUri') as string;
  const audience = urlParams.get('audience') as string;
  const scope = urlParams.get('scope') as string;
  const environment = {
    sandbox: config.Environment.SANDBOX,
    production: config.Environment.PRODUCTION,
  }[urlParams.get('environment') || 'sandbox'];

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
  useEffect(() => {
    const passportInstance = usePassportInstance();
    if (!passportInstance) return;

    const primaryRevenueElement = document.querySelector<ImmutableWebComponent>(
      'imtbl-primary-revenue',
    );
    primaryRevenueElement?.addPassportOption(passportInstance as any);

    const urlParams = new URLSearchParams(window.location.search);
    const login = urlParams.get('login') as string;
    if (login) {
      passportInstance.loginCallback();
    }
  }, []);

  const widgetConfig = {
    theme: WidgetTheme.LIGHT,
    environment: Environment.SANDBOX,
  };
  const testLink = 'http://localhost:3001/primary-revenue?clientId=XuGsHvMqMJrb73diq1fCswWwn4AYhcM6&redirectUri=http://localhost:3001/primary-revenue&logoutRedirectUri=http://localhost:3001/primary-revenue&audience=platform_api&scope=openid%20offline_access%20email%20transact&environment=sandbox'; // eslint-disable-line max-len
  return (
    <>
      <imtbl-primary-revenue widgetConfig={JSON.stringify(widgetConfig)} />
      <br />
      <h1><a href={testLink}>Passport On</a></h1>
      <br />
      <h1><a href="/primary-revenue">Passport Off</a></h1>
    </>
  );
}

export default PrimaryRevenueWebView;
