/* eslint-disable no-console */
import { strict as assert } from 'assert';
import axios from 'axios';

import { SharedState } from './shared-state';
import { BASE_URI, CONTRACT_URI } from '../lib/collection';
import CONTRACT_METADATA from '../metadata/contract.json';
import uploadedNFTMetadata1 from '../metadata/nft-metadata/1.uploaded.json';
import uploadedNFTMetadata2 from '../metadata/nft-metadata/2.uploaded.json';
import uploadedNFTMetadata3 from '../metadata/nft-metadata/3.uploaded.json';
import uploadedNFTMetadata4 from '../metadata/nft-metadata/4.uploaded.json';
import uploadedNFTMetadata5 from '../metadata/nft-metadata/5.uploaded.json';
import uploadedNFTMetadata6 from '../metadata/nft-metadata/6.uploaded.json';
import uploadedNFTMetadata7 from '../metadata/nft-metadata/7.uploaded.json';
import uploadedNFTMetadata8 from '../metadata/nft-metadata/8.uploaded.json';
import indexedNFTMetadata1 from '../metadata/nft-metadata/1.indexed.json';
import indexedNFTMetadata2 from '../metadata/nft-metadata/2.indexed.json';
import indexedNFTMetadata3 from '../metadata/nft-metadata/3.indexed.json';
import indexedNFTMetadata4 from '../metadata/nft-metadata/4.indexed.json';
import indexedNFTMetadata5 from '../metadata/nft-metadata/5.indexed.json';
import indexedNFTMetadata6 from '../metadata/nft-metadata/6.indexed.json';
import indexedNFTMetadata7 from '../metadata/nft-metadata/7.indexed.json';
import indexedNFTMetadata8 from '../metadata/nft-metadata/8.indexed.json';

export { CONTRACT_METADATA };

export const UPLOADED_TOKEN_METADATA = Object.fromEntries(
  [
    uploadedNFTMetadata1,
    uploadedNFTMetadata2,
    uploadedNFTMetadata3,
    uploadedNFTMetadata4,
    uploadedNFTMetadata5,
    uploadedNFTMetadata6,
    uploadedNFTMetadata7,
    uploadedNFTMetadata8,
  ].map((m) => {
    if ('token_id' in m) return [m.token_id, m];
    if ('id' in m) return [m.id, m];
    throw new Error('please ensure uploaded metadata has token_id or id.');
  }),
);

export const INDEXED_TOKEN_METADATA = Object.fromEntries(
  [
    indexedNFTMetadata1,
    indexedNFTMetadata2,
    indexedNFTMetadata3,
    indexedNFTMetadata4,
    indexedNFTMetadata5,
    indexedNFTMetadata6,
    indexedNFTMetadata7,
    indexedNFTMetadata8,
  ].map((m) => [m.token_id, m]),
);

export const TOKEN_IDS = Object.keys(UPLOADED_TOKEN_METADATA);

// @binding([SharedState])
export class Metadata {
  constructor(protected sharedState: SharedState) {}

  // @given('uploaded metadata', undefined, 30 * 1000)
  public async uploaded() {
    if (this.sharedState.metadataChecked) {
      console.log('✅ Metadata already checked');
      return;
    }

    let response;
    try {
      response = await axios.get(CONTRACT_URI);
      assert.deepEqual(
        response.data,
        CONTRACT_METADATA,
        'upload contract metadata',
      );
    } catch (ex: any) {
      // eslint-disable-next-line consistent-return
      return assert.fail(`Failed to get contract metadata: ${ex.message}`);
    }

    try {
      // Check tokens.
      // eslint-disable-next-line no-restricted-syntax, guard-for-in
      for (const tokenId in UPLOADED_TOKEN_METADATA) {
        // eslint-disable-next-line @typescript-eslint/no-shadow, no-await-in-loop
        const response = await axios.get(`${BASE_URI}/${tokenId}`);
        assert.deepEqual(
          response.data,
          UPLOADED_TOKEN_METADATA[tokenId],
          `upload token ${tokenId} metadata`,
        );
      }

      this.sharedState.metadataChecked = true;
    } catch (ex: any) {
      // eslint-disable-next-line consistent-return
      return assert.fail(`Failed to get token metadata: ${ex.message}`);
    }
  }
}
