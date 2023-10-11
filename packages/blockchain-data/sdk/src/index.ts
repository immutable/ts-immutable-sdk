import {
  mr,
  ActivitiesApi,
  ChainsApi,
  CollectionsApi,
  MetadataApi,
  NFTOwnersApi,
  NFTsApi,
  TokensApi,
} from '@imtbl/generated-clients';
import { APIError } from './types/errors';
import { BlockchainData } from './blockchain-data';
import { BlockchainDataModuleConfiguration } from './config';

type ActivityType = mr.ActivityType;

export {
  ActivitiesApi,
  ChainsApi,
  CollectionsApi,
  MetadataApi,
  NFTOwnersApi,
  NFTsApi,
  TokensApi,
  APIError,
  BlockchainData,
  BlockchainDataModuleConfiguration,
  ActivityType,
};
