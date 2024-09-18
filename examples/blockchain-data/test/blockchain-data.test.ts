import { describe, expect, test } from '@jest/globals';

import { verifySuccessfulMints } from '../api-examples-with-node/verify-successful-mints';
import { getCollection } from '../api-examples-with-node/get-collection';
import { listCollectionsByNFTOwner } from '../api-examples-with-node/list-collections-by-owner';
import { listCollections } from '../api-examples-with-node/list-collections';

const CONTRACT_ADDRESS = '0x46490961376c91db6b53458d1196888de269a25c';
const NFT_OWNER = '0x9C1634bebC88653D2Aebf4c14a3031f62092b1D9'

describe('verifySuccessfulMints', () => {
  test('listing activities from a contract address returns mint activities', async () => {
    const result = await verifySuccessfulMints(CONTRACT_ADDRESS);
    expect(result.result.length).toBeGreaterThan(0);
  });
});

describe('Collections', () => {
  describe('listCollections', () => {
    test('returns a list of collections', async () => {
      const result = await listCollections();
      expect(result.result.length).toBeGreaterThan(0);
    });
  });

  describe('listCollectionsByNFTOwner', () => {
    test('returns a list of collections', async () => {
      const result = await listCollectionsByNFTOwner(NFT_OWNER);
      expect(result.result.length).toBeGreaterThan(0);
    });
  });

  describe('getCollection', () => {
    test('returns a collection', async () => {
      const result = await getCollection(CONTRACT_ADDRESS);
      expect(result.result).not.toBe(null);
    });
  });
});
