import { describe, expect, test } from '@jest/globals';
import { blockchainData } from '@imtbl/sdk';

import {
  verifySuccessfulMints,
  getChains,
  getCollection,
  getMetadata,
  getNFT,
  getToken,
  listAllNFTs,
  listAllNFTOwners,
  listChains,
  listMetadata,
  listCollections,
  listCollectionsByNFTOwner,
  listActivities,
  listActivitiesByActivityType,
  listNFTsByAccountAddress,
  listNFTsByCollection,
  listNFTOwnersByTokenId,
  listNFTOwnersByContractAddress,
  listTokens,
} from '../api-examples-with-node';

const CHAIN_NAME = 'imtbl-zkevm-testnet';
const CONTRACT_ADDRESS = '0x21F0D60cfE554B6d5b7f9E799BDeBD97C5d64274';
const NFT_OWNER = '0x9C1634bebC88653D2Aebf4c14a3031f62092b1D9';
const TOKEN_ADDRESS = '0x007a4bdf308ca0074d7b95628e72a62f12b2c58f';

describe('Chains', () => {
  describe('listChains', () => {
    test('returns a list of chains', async () => {
      const result = await listChains({});
      expect(result.result.length).toBeGreaterThan(0);
    });
  });
});

describe('Activities', () => {
  describe('listActivities', () => {
    test('listing activities from a contract address returns activities', async () => {
      const result = await listActivities(CHAIN_NAME, CONTRACT_ADDRESS, 10);
      expect(result.result.length).toBeGreaterThan(0);
    });
  });

  describe('listActivities', () => {
    test('listing activities by activity type returns activities of that type', async () => {
      const result = await listActivitiesByActivityType(
        CONTRACT_ADDRESS,
        blockchainData.Types.ActivityType.Mint,
      );
      expect(result.result[0].type).toBe(
        blockchainData.Types.ActivityType.Mint,
      );
    });
  });

  describe('verifySuccessfulMints', () => {
    test('listing activities from a contract address returns mint activities', async () => {
      const result = await verifySuccessfulMints(CONTRACT_ADDRESS);
      expect(result.result.length).toBeGreaterThan(0);
    });
  });
});

describe('Collections', () => {
  describe('listCollections', () => {
    test('returns a list of collections', async () => {
      const result = await listCollections(CHAIN_NAME);
      expect(result.result.length).toBeGreaterThan(0);
    });
  });

  describe('listCollectionsByNFTOwner', () => {
    test('returns a list of collections', async () => {
      const result = await listCollectionsByNFTOwner(CHAIN_NAME, NFT_OWNER);
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

describe('Metadata', () => {
  describe('getMetadata', () => {
    test('returns metadata', async () => {
      const result = await getMetadata(
        CHAIN_NAME,
        CONTRACT_ADDRESS,
        '018dc943-03b1-549d-6ddf-17935bae0c0e',
      );
      expect(result.result).not.toBe(null);
    });
  });
  describe('listMetadata', () => {
    test('lists metadata', async () => {
      const result = await listMetadata(CHAIN_NAME, CONTRACT_ADDRESS);
      expect(result.result.length).toBeGreaterThan(0);
    });
  });
});

describe('NFTs', () => {
  describe('listAllNFTs', () => {
    test('returns a list of NFTs', async () => {
      const result = await listAllNFTs();
      expect(result.result.length).toBeGreaterThan(0);
    });
  });

  describe('listNFTsByAccountAddress', () => {
    test('returns a list of NFTs', async () => {
      const result = await listNFTsByAccountAddress(
        CHAIN_NAME,
        '0xd9cfd0a6d1496a4da6e8ad570344e1482ce3c257',
        NFT_OWNER,
      );
      expect(result.result.length).toBeGreaterThan(0);
    });
  });

  describe('listNFTsByCollection', () => {
    test('returns a list of NFTs', async () => {
      const result = await listNFTsByCollection(
        '0xd9cfd0a6d1496a4da6e8ad570344e1482ce3c257',
        ['1', '2'],
      );
      expect(result.result.length).toBeGreaterThan(0);
    });
  });

  test('returns nft', async () => {
    const result = await getNFT(CHAIN_NAME, CONTRACT_ADDRESS, '199144');
    expect(result.result).not.toBe(null);
  });
});

describe('NFT Owners', () => {
  describe('listAllNFTOwners', () => {
    test('returns a list of NFT Owners', async () => {
      const result = await listAllNFTOwners();
      expect(result.result.length).toBeGreaterThan(0);
    });
  });

  describe('listNFTOwnersByContractAddress', () => {
    test('returns a list of NFT Owners', async () => {
      const result = await listNFTOwnersByContractAddress(
        '0xd9cfd0a6d1496a4da6e8ad570344e1482ce3c257',
      );
      expect(result.result.length).toBeGreaterThan(0);
    });
  });

  describe('listNFTOwnersByTokenId', () => {
    test('returns a list of NFT Owners', async () => {
      const result = await listNFTOwnersByTokenId(
        '0xd9cfd0a6d1496a4da6e8ad570344e1482ce3c257',
        '1',
      );
      expect(result.result.length).toBeGreaterThan(0);
    });
  });
});

describe('Tokens', () => {
  describe('listTokens', () => {
    test('returns a list of tokens', async () => {
      const result = await listTokens();
      expect(result.result.length).toBeGreaterThan(0);
    });
  });

  describe('getToken', () => {
    test('returns a token', async () => {
      const result = await getToken(TOKEN_ADDRESS);
      expect(result).not.toBe(null);
    });
  });
});

describe('Setup', () => {
  describe('getChains', () => {
    test('returns a chain', async () => {
      const result = await getChains({});
      expect(result).not.toBe(null);
    });
  });
});
