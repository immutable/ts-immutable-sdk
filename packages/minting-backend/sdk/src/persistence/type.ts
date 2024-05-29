/* eslint-disable @typescript-eslint/naming-convention */
export type CreateMintRequest = {
  contract_address: string;
  asset_id: string; // the web2 game item id
  metadata: any;
  owner_address: string;
  amount?: number;
};

export type MintRequest = {
  id: string;
  contract_address: string;
  wallet_address: string;
  asset_id: string; // the web2 game item id
  metadata: any;
  owner_address: string;
  tried_count: number;
  amount: number | null;
};

export type SubmittedMintRequest = {
  tokenId: string | null;
  status: string;
  assetId: string;
  contractAddress: string;
  ownerAddress: string;
  metadataId: string;
  imtblZkevmMintRequestUpdatedId: string;
  error: any | null;
};

export interface MintingPersistence {
  recordMint: (request: CreateMintRequest) => Promise<void>;
  getNextBatchForSubmission: (limit: number) => Promise<MintRequest[]>;
  updateMintingStatusToSubmitted: (ids: string[]) => Promise<void>;
  updateMintingStatusToSubmissionFailed: (ids: string[]) => Promise<void>;
  syncMintingStatus: (
    submittedMintRequest: SubmittedMintRequest
  ) => Promise<void>;
  markAsConflict: (
    assetIds: string[],
    contractAddress: string
  ) => Promise<void>;
  resetMintingStatus: (ids: string[]) => Promise<void>;
  markForRetry: (ids: string[]) => Promise<void>;
  getMintingRequest: (
    contractAddress: string,
    referenceId: string
  ) => Promise<MintRequest | null>;
}
