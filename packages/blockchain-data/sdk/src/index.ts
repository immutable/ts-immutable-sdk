import {
  mr,
  ActivitiesTypes,
  ChainsTypes,
  CollectionsTypes,
  MetadataTypes,
  NFTOwnersTypes,
  NFTsTypes,
  TokensTypes,
} from '@imtbl/generated-clients';

import { APIError } from './types/errors';
import { BlockchainData } from './blockchain-data';
import { BlockchainDataModuleConfiguration } from './config';

type ActivityType = mr.ActivityType;

export * as Types from '@imtbl/generated-clients';

export {
  ActivitiesTypes,
  ChainsTypes,
  CollectionsTypes,
  MetadataTypes,
  NFTOwnersTypes,
  NFTsTypes,
  TokensTypes,
  APIError,
  BlockchainData,
  BlockchainDataModuleConfiguration,
  ActivityType,
};
