/* eslint-disable @typescript-eslint/naming-convention */
export type MintRequest = {
  id: string;
  contract_address: string;
  wallet_address: string;
  asset_id: string; // the web2 game item id
  metadata: any;
  owner_address: string;
  tried_count: number;
};

export type SubmittedMintRequest = {
  tokenId: string;
  status: string;
  assetId: string;
  contractAddress: string;
  ownerAddress: string;
  metadataId: string;
  imtblZkevmMintRequestUpdatedId: string;
  error: string;
};

export interface MintingPersistence<DBClient> {
  client: DBClient;
  recordMint: (request: MintRequest) => Promise<void>;
  getNextBatchForSubmission: (limit: number) => Promise<MintRequest[]>;
  updateMintingStatusToSubmitted: (id: string[]) => Promise<void>;
  updateMintingStatusToSubmissionFailed: (id: string[]) => Promise<void>;
  syncMintingStatus: (submittedMintRequest: SubmittedMintRequest) => Promise<void>;
  // eslint-disable-next-line max-len
  markAsConflict: (assetIds: string[], contractAddress: string, imtblZkevmMintRequestUpdatedId: string) => Promise<void>;
  resetMintingStatus: (ids: string[]) => Promise<void>;
  markForRetry: (ids: string[], maxNumberOfTries: number) => Promise<void>;
  getMintingRequest: (contractAddress: string, referenceId: string) => Promise<MintRequest>;
}
