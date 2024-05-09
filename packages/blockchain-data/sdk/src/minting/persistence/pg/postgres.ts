import { client } from '../../dbClient/postgres';
import { CreateMintRequest, MintingPersistence, SubmittedMintRequest } from '../type';

export const mintingPersistence: MintingPersistence = {
  recordMint: async (request: CreateMintRequest) => {
    const r = await client.query(
      `
      INSERT INTO im_assets (asset_id, contract_address, owner_address, metadata) 
      VALUES ($1, $2, $3, $4) ON CONFLICT (asset_id) DO NOTHING;
      `,
      [request.asset_id, request.contract_address, request.owner_address, request.metadata]
    );
    if (r.rowCount === 0) {
      throw new Error('Duplicated mint');
    }
  },
  getNextBatchForSubmission: async (limit: number) => {
    const res = await client.query(`
      UPDATE im_assets SET minting_status = 'submitting' WHERE minting_status IS NULL and id in (
          select id from im_assets where minting_status is null limit $1 for update skip locked
      ) returning *;
    `, [limit]);
    return res.rows;
  },
  updateMintingStatusToSubmitted: async (ids: string[]) => {
    await client.query(`
              UPDATE im_assets SET minting_status = $2 WHERE id = ANY($1);
            `, [ids, 'submitted']);
  },
  syncMintingStatus: async (submittedMintRequest: SubmittedMintRequest) => {
    // doing a upsert just in case the row has not been created yet
    await client.query(`
      INSERT INTO im_assets (
        asset_id, 
        contract_address, 
        owner_address, 
        token_id, 
        minting_status, 
        metadata_id, 
        last_imtbl_zkevm_mint_request_updated_id, 
        error
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (asset_id, contract_address)
      DO UPDATE SET 
        owner_address = $3,
        token_id = $4,
        minting_status = $5,
        metadata_id = $6,
        last_imtbl_zkevm_mint_request_updated_id = $7,
        error = $8
      where (
        im_assets.last_imtbl_zkevm_mint_request_updated_id < $7 OR 
        im_assets.last_imtbl_zkevm_mint_request_updated_id is null
      );
      `, [
      submittedMintRequest.assetId,
      submittedMintRequest.contractAddress,
      submittedMintRequest.ownerAddress,
      submittedMintRequest.tokenId,
      submittedMintRequest.status,
      submittedMintRequest.metadataId,
      submittedMintRequest.imtblZkevmMintRequestUpdatedId,
      submittedMintRequest.error]);
  },
  markAsConflict: async (assetIds: string[], contractAddress: string, imtblZkevmMintRequestUpdatedId: string) => {
    await client.query(`
      UPDATE im_assets 
      SET minting_status = 'conflicting' 
      WHERE asset_id = ANY($1) 
        AND contract_address = $2 
        AND (
          last_imtbl_zkevm_mint_request_updated_id <= $3 OR 
          last_imtbl_zkevm_mint_request_updated_id is null
        );
            `, [assetIds, contractAddress, imtblZkevmMintRequestUpdatedId]);
  },
  resetMintingStatus: async (ids: string[]) => {
    await client.query(`
            UPDATE im_assets SET minting_status = null WHERE id = ANY($1) and contract_address = $2;
            `, [ids]);
  },
  markForRetry: async (ids: string[], maxNumberOfTries: number) => {
    await client.query(`
      UPDATE im_assets 
      SET minting_status = null, tried_count = tried_count + 1 WHERE id = ANY($1) and tried_count <= $2;
      `, [ids, maxNumberOfTries]);
  },
  updateMintingStatusToSubmissionFailed: async (ids: string[]) => {
    await client.query(`
      UPDATE im_assets SET minting_status = 'submission_failed' WHERE id = ANY($1);
    `, [ids]);
  },
  getMintingRequest: async (contractAddress: string, referenceId: string) => {
    const res = await client.query(`
      SELECT * FROM im_assets WHERE contract_address = $1 and asset_id = $2;
    `, [contractAddress, referenceId]);
    return res.rows[0];
  }
};
