import { mr } from '@imtbl/generated-clients';
import * as Types from './types/api';
import { APIError } from './types/errors';
import { BlockchainData } from './blockchain-data';
import { BlockchainDataModuleConfiguration } from './config';

type ActivityType = mr.ActivityType;

export {
  Types,
  APIError,
  BlockchainData,
  BlockchainDataModuleConfiguration,
  ActivityType,
};
