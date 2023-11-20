import { Environment, ImmutableConfiguration } from '@imtbl/sdk/config';
import { Passport } from '@imtbl/sdk/passport';

const App = () => {
  const passportInstance = new Passport({
    baseConfig: new ImmutableConfiguration({
      environment: Environment.SANDBOX,
    }),
    clientId: '5cN3OdDnJl4dlRuUj0rFkBCDrABgEmKS',
    redirectUri: 'https://localhost:3000/redirect',
    logoutRedirectUri: 'https://localhost:3000/logout',
    audience: 'platform_api',
    scope: 'openid offline_access email transact',
  });
  console.log(passportInstance);

  return <h1>Hello world</h1>;
};

export default App;
