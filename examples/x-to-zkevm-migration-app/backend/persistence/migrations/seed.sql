CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  x_collection_address VARCHAR NOT NULL,
  zkevm_collection_address VARCHAR NOT NULL,
  token_id VARCHAR NOT NULL UNIQUE,
  zkevm_wallet_address VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  burn_id VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);