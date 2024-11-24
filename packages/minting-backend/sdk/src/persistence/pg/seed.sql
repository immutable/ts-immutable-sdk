CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS im_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL, 
  owner_address varchar NOT NULL, -- TODO: should be case insensitive
  metadata jsonb,
  token_id varchar NULL,
  contract_address varchar NOT NULL,
  error varchar NULL,
  -- NOTE: minting_status is purposely not an enum for ease of future expansion without running a migration
  minting_status varchar NULL,
  metadata_id UUID NULL,
  tried_count INT DEFAULT 0,
  last_imtbl_zkevm_mint_request_updated_id UUID NULL,
  amount INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS im_assets_uindex ON im_assets (asset_id, contract_address);