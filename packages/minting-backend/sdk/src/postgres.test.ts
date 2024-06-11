/* eslint-disable @typescript-eslint/naming-convention */
// tests all functions in ./postgres.ts file

import { Pool } from 'pg';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { ZkevmMintRequestUpdated } from '@imtbl/webhook';
import { mintingPersistence } from './persistence/pg/postgres';
import { CreateMintRequest } from './persistence/type';
import { processMint, recordMint, submitMintingRequests } from './minting';

describe('postgres minting backend', () => {
  test('record, submit, process webhook event in happy path', async () => {
    const container = await new PostgreSqlContainer().start();
    const pool = new Pool({
      user: container.getUsername(),
      password: container.getPassword(),
      host: container.getHost(),
      port: container.getMappedPort(5432),
      database: container.getDatabase(),
    });

    // run seed.sql relative to this file
    const seed = fs.readFileSync('./src/persistence/pg/seed.sql').toString();
    await pool.query(seed);

    const persistence = mintingPersistence(pool);

    // record mint requests
    const assetId1 = uuid();
    const mintRequest: CreateMintRequest = {
      contract_address: '0x123',
      asset_id: assetId1,
      metadata: { name: 'test' },
      owner_address: '0x123',
      token_id: '1',
      amount: 1,
    };
    await recordMint(persistence, mintRequest);

    const createMintRequest = jest.fn().mockResolvedValue({
      imx_remaining_mint_requests: '100',
      imx_mint_requests_limit_reset: `${new Date().toISOString()}`,
    });
    const blockchainDataSDKClient: any = {
      createMintRequest,
    };
    await submitMintingRequests(persistence, blockchainDataSDKClient, {}, console, 1);
    expect(createMintRequest).toBeCalledWith({
      chainName: 'imtbl-zkevm-testnet',
      contractAddress: mintRequest.contract_address,
      createMintRequestRequest: {
        assets: [{
          reference_id: assetId1,
          owner_address: mintRequest.owner_address,
          metadata: mintRequest.metadata,
          token_id: mintRequest.token_id,
          amount: '1',
        }]
      },
    });
    // the status should be updated to submitted
    const { rows } = await pool.query('SELECT * FROM im_assets WHERE minting_status = $1', ['submitted']);
    expect(rows.length).toBe(1);

    // process webhook event
    const metadataId = uuid();
    const imtblZkevmMintRequestUpdatedId = uuid();
    const webhookEvent: ZkevmMintRequestUpdated = {
      event_name: 'imtbl_zkevm_mint_request_updated',
      event_id: imtblZkevmMintRequestUpdatedId,
      chain: 'imtbl-zkevm-testnet',
      data: {
        chain: {
          id: '1',
          name: 'imtbl-zkevm-testnet',
        },
        contract_address: mintRequest.contract_address,
        owner_address: mintRequest.owner_address,
        reference_id: assetId1,
        metadata_id: metadataId,
        token_id: '1',
        status: 'succeeded',
        transaction_hash: null,
        activity_id: null,
        error: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        amount: 1,
      },
    };

    await processMint(persistence, webhookEvent);

    // check the status is updated
    const { rows: rows2 } = await pool.query('SELECT * FROM im_assets WHERE minting_status = $1', ['succeeded']);
    console.log(rows2);
    expect(rows2.length).toBe(1);
    expect(rows2[0].metadata_id).toBe(metadataId);
    expect(rows2[0].last_imtbl_zkevm_mint_request_updated_id).toBe(imtblZkevmMintRequestUpdatedId);
    expect(rows2[0].token_id).toBe('1');
    expect(rows2[0].amount).toBe(1);
    expect(rows2[0].error).toBeNull();
    expect(rows2[0].minting_status).toBe('succeeded');

    await pool.end();
  }, 10000);

  // test("record, submit, process webhook event in unhappy path", async () => {

  // });
});
