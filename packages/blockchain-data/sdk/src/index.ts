import { mr } from '@imtbl/generated-clients';
import { APIError } from './types/errors';
import { BlockchainData } from './blockchain-data';
import { BlockchainDataModuleConfiguration } from './config';

type ActivityType = mr.ActivityType;

export {
  APIError,
  BlockchainData,
  BlockchainDataModuleConfiguration,
  ActivityType,
};
