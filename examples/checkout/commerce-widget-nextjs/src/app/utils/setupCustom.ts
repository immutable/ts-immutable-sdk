// Import the checkout and config modules from the Immutable SDK package
import { checkout, config } from '@imtbl/sdk';

// Create a new Immutable SDK configuration

// Replace with your Publishable Key from the Immutable Hub
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_PUBLISHABLE_KEY ?? '' 

// Set the environment to SANDBOX for testnet or PRODUCTION for mainnet
const baseConfig = {
  environment: config.Environment.SANDBOX,
  publishableKey: PUBLISHABLE_KEY,
};

// Instantiate the Checkout SDKs with the default configurations
export const checkoutSDK = new checkout.Checkout({
  baseConfig,
  bridge: { enable: true },
  onRamp: { enable: true },
  swap: { enable: true },
  // passport: <optionally add Passport instance>
});
