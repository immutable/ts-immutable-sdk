// Import the checkout, passport and config modules from the Immutable SDK package
import { checkout, passport, config } from '@imtbl/sdk';
import { useEffect } from 'react';

// Create passport instance with config
const PUBLISHABLE_KEY = 'pk_imapik-test-testtest_testing'; // Replace with your Publishable Key from the Immutable Hub
const CLIENT_ID = 'TEST_ID'; // Replace with your passport client ID

const passportInstance = new passport.Passport({
  baseConfig: {
    environment: config.Environment.SANDBOX,
    publishableKey: PUBLISHABLE_KEY,
  },
  clientId: CLIENT_ID,
  redirectUri: 'https://localhost:3000/redirect',
  logoutRedirectUri: 'https://localhost:3000/logout',
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
});

export function App() {
  // Create a new Immutable SDK configuration
  const baseConfig = {
    environment: config.Environment.SANDBOX,
    publishableKey: PUBLISHABLE_KEY,
  };

  // Instantiate the Checkout SDK with passport configured
  const checkoutSDK = new checkout.Checkout({
    baseConfig,
    passport: passportInstance,
  });

  useEffect(() => {
    (async () => {
      const widgets = await checkoutSDK.widgets({
        config: { theme: checkout.WidgetTheme.DARK },
      });
      const connect = widgets.create(checkout.WidgetType.CONNECT);
      connect.mount('connect');
    })();
  }, []);

  return <div id="connect"></div>;
}

export default App;
