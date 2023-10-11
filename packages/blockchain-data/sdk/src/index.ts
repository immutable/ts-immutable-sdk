import { mr, mrTypes } from '@imtbl/generated-clients';
import { APIError } from './types/errors';
import { BlockchainData } from './blockchain-data';
import { BlockchainDataModuleConfiguration } from './config';

type ActivityType = mr.ActivityType;

export {
  mrTypes as types,
  APIError,
  BlockchainData,
  BlockchainDataModuleConfiguration,
  ActivityType,
};
