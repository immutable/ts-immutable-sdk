import { config as immutableConfig, blockchainData } from '@imtbl/sdk';

export const config: blockchainData.BlockchainDataModuleConfiguration = {
  baseConfig: {
    environment: immutableConfig.Environment.SANDBOX,
    publishableKey: process.env.PUBLISHABLE_KEY,
  },
};
