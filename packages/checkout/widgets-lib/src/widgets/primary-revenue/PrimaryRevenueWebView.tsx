import { useEffect, useState } from 'react';
import { Environment } from '@imtbl/config';
import { config, passport } from '@imtbl/sdk';

import { WidgetTheme } from '../../lib';
import { ImmutableWebComponent } from '../ImmutableWebComponent';

const defaultPassportConfig = {
  environment: 'sandbox',
  clientId: 'XuGsHvMqMJrb73diq1fCswWwn4AYhcM6',
  redirectUri: 'http://localhost:3001/primary-revenue?login=true',
  logoutRedirectUri: 'http://localhost:3001/primary-revenue?logout=true',
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
};

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

const usePassportInstance = (passportConfig: any) => {
  const {
    clientId,
    redirectUri,
    logoutRedirectUri,
    audience,
    scope,
    environment,
  } = passportConfig;

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
  const [passportConfig, setPassportConfig] = useState(
    JSON.stringify(defaultPassportConfig, null, 2),
  );
  const [passportOn, setPassportOn] = useState(false);

  const handlePassportConfigChange = (e: any) => {
    setPassportConfig(e.target.value);
  };

  const handlePassportConfigFormat = (e: any) => {
    let value;
    try {
      value = JSON.parse(e.target.value);
    } catch (error) { /** */ }

    if (value) {
      setPassportConfig(JSON.stringify(value, null, 2));
      localStorage.setItem('passportConfig', JSON.stringify(value));
    }
  };

  useEffect(() => {
    if (!passportOn) return;

    const primaryRevenueElement = document.querySelector<ImmutableWebComponent>(
      'imtbl-primary-revenue',
    );
    const passportInstance = usePassportInstance(JSON.parse(passportConfig));
    primaryRevenueElement?.addPassportOption(passportInstance as any);
  }, [passportOn, passportConfig]);

  useEffect(() => {
    const passportInstance = usePassportInstance(JSON.parse(passportConfig));

    if (login && passportInstance) {
      passportInstance.loginCallback();
    }
  }, [login]);

  useEffect(() => {
    const lsPassportConfig = localStorage.getItem('passportConfig');
    if (lsPassportConfig) {
      setPassportConfig(JSON.stringify(JSON.parse(lsPassportConfig), null, 2));
    }
  }, []);

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
        <textarea
          rows={10}
          cols={50}
          value={passportConfig}
          onChange={handlePassportConfigChange}
          onBlur={handlePassportConfigFormat}
        />
        <br />
        <button type="button" onClick={() => { setPassportOn(true); }}>
          Passport On
        </button>
      </h1>
    </>
  );
}

export default PrimaryRevenueWebView;
