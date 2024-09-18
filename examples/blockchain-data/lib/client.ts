import { config as immutableConfig, blockchainData } from '@imtbl/sdk';

export const config: blockchainData.BlockchainDataModuleConfiguration = {
  baseConfig: {
    environment: immutableConfig.Environment.SANDBOX,
    apiKey: process.env.API_KEY,
    publishableKey: process.env.PUBLISHABLE_KEY,
  },
};

export const client = new blockchainData.BlockchainData(config);
