import {} from './pre-start'; // Must be the first import
import { BlockchainData, submitMintingRequests, mintingPersistencePg } from '@imtbl/blockchain-data';
import logger from 'jet-logger';
import server from './server';
import { Environment } from '@imtbl/config';


// **** Run **** //

const SERVER_START_MSG = ('Express server started on port: 3000');

const baseConfig = {
  environment: process.env.IMBTL_ENV as Environment,
  publishableKey: process.env.IMBTL_PUBLISHABLE_KEY,
  apiKey: process.env.IMBTL_API_KEY,
};
  
const blockchainDataSDKClient = new BlockchainData({
  baseConfig,
});
  

server.listen(3000, () => {
  logger.info(SERVER_START_MSG);
  // a long running process for submit minting requests
  submitMintingRequests(mintingPersistencePg, blockchainDataSDKClient, {});
});