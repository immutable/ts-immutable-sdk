import { mr, BlockchainData as Types } from '@imtbl/generated-clients';

import { APIError } from './types/errors';
import { BlockchainData } from './blockchain-data';
import { BlockchainDataModuleConfiguration } from './config';

/**
 * @deprecated since version 1.1.5
 * Please use Types.ActivityType instead
 * import { Types } from '@imtbl/blockchain-data'
 */
type ActivityType = mr.ActivityType;

export {
  Types,
  APIError,
  BlockchainData
};
export type {
  BlockchainDataModuleConfiguration,
  ActivityType
};
