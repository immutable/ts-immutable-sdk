import { config, blockchainData } from '@imtbl/sdk';

const API_KEY = 'YOUR_API_KEY';
const PUBLISHABLE_KEY = 'YOUR_PUBLISHABLE_KEY';

// #doc blockchain-data-api-setup-with-api-key
const client = new blockchainData.BlockchainData({
  baseConfig: {
    environment: config.Environment.PRODUCTION,
    apiKey: API_KEY,
    publishableKey: PUBLISHABLE_KEY,
  },
});
// #enddoc blockchain-data-api-setup-with-api-key
