import { mr, BlockchainData as Types } from '@imtbl/generated-clients';

import { APIError } from './types/errors';
import { BlockchainData } from './blockchain-data';
import { BlockchainDataModuleConfiguration } from './config';
import {
  submitMintingRequests, processMint, recordMint, mintingPersistencePg
} from './minting';

/**
 * @deprecated since version 1.1.5
 * Please use Types.ActivityType instead
 * import { Types } from '@imtbl/blockchain-data'
 */
type ActivityType = mr.ActivityType;

export {
  Types,
  APIError,
  BlockchainData,
  BlockchainDataModuleConfiguration,
  ActivityType,
  submitMintingRequests, processMint, recordMint, mintingPersistencePg
};
