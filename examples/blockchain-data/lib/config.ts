import { config as immutableConfig, blockchainData } from '@imtbl/sdk';

const PUBLISHABLE_KEY = 'YOUR_PUBLISHABLE_KEY'; // Replace with your Publishable Key from the Immutable Hub\n

export const config: blockchainData.BlockchainDataModuleConfiguration = {
  baseConfig: {
    environment: immutableConfig.Environment.SANDBOX,
    publishableKey: PUBLISHABLE_KEY,
  },
};
