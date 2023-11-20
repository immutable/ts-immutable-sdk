import { Environment, ImmutableConfiguration } from '@imtbl/sdk/config';
import { Passport } from '@imtbl/sdk/passport';
import {
  clientId,
  redirectUri,
  logoutRedirectUri,
  audience,
  scope,
} from '@/lib/env';

const App = () => {
  const passportInstance = new Passport({
    baseConfig: new ImmutableConfiguration({
      environment: Environment.SANDBOX,
    }),
    clientId,
    redirectUri,
    logoutRedirectUri,
    audience,
    scope,
  });
  console.log(passportInstance);

  return <h1>Hello world</h1>;
};

export default App;
