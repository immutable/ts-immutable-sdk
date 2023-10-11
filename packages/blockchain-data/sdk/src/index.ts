import { mr, activitiesTypes, chainTypes } from '@imtbl/generated-clients';
import { APIError } from './types/errors';
import { BlockchainData } from './blockchain-data';
import { BlockchainDataModuleConfiguration } from './config';

type ActivityType = mr.ActivityType;

export {
  activitiesTypes as ActivitiesApi,
  chainTypes as ChainsApi,
  APIError,
  BlockchainData,
  BlockchainDataModuleConfiguration,
  ActivityType,
};
