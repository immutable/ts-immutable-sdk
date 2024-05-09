import { setup } from './pre-start.js'; // Must be the first import
import { blockchainData } from '@imtbl/sdk';
import server from './server.js';
import { config } from '@imtbl/sdk';

setup();
// **** Run **** //

const SERVER_START_MSG = ('Express server started on port: 3000');

const baseConfig = {
  environment: process.env.IMBTL_ENV as config.Environment,
  publishableKey: process.env.IMBTL_PUBLISHABLE_KEY,
  apiKey: process.env.IMBTL_API_KEY,
};

const blockchainDataSDKClient = new blockchainData.BlockchainData({
  baseConfig,
});

server.listen(3000, () => {
  console.log(SERVER_START_MSG);
  // a long running process for submit minting requests
  blockchainData.submitMintingRequests(blockchainData.mintingPersistencePg, blockchainDataSDKClient, {});
});