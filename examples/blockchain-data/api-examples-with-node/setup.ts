import { config, blockchainData } from '@imtbl/sdk';

const PUBLISHABLE_KEY = 'YOUR_PUBLISHABLE_KEY'; // Replace with your Publishable Key from the Immutable Hub

const client = new blockchainData.BlockchainData({
  baseConfig: {
    environment: config.Environment.PRODUCTION,
    publishableKey: PUBLISHABLE_KEY,
  },
});
