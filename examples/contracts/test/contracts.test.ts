import { describe, expect, test } from '@jest/globals';
import {
  batchMintERC721ByID,
  batchMintERC721ByQuantity,
} from '../contract-interaction-with-viem';

const MINT_CONTRACT_ADDRESS = 'YOUR_MINT_CONTRACT_ADDRESS' as `0x${string}`;
const MINT_RECIPIENT = 'YOUR_MINT_RECIPIENT' as `0x${string}`;
const MINT_PRIVATE_KEY = 'YOUR_MINT_PRIVATE_KEY' as `0x${string}`;

describe('ImmutableERC721', () => {
  describe('batchMintERC721ByID', () => {
    // Write methods are not yet tested as part of our CI system for simplification of testing on-chain
    // calls that require gas payment idempotently, however are added here for testing locally.
    test.skip('returns a valid transaction hash', async () => {
      const txHash = await batchMintERC721ByID(
        MINT_PRIVATE_KEY,
        MINT_CONTRACT_ADDRESS,
        [
          {
            to: MINT_RECIPIENT,
            tokenIds: [BigInt(10)],
          },
        ],
      );
      expect(txHash).not.toBe('');
    });
  });

  describe('batchMintERC721ByQuantity', () => {
    // Write methods are not yet tested as part of our CI system for simplification of testing on-chain
    // calls that require gas payment idempotently, however are added here for testing locally.
    test.skip('returns a valid transaction hash', async () => {
      const txHash = await batchMintERC721ByQuantity(
        MINT_PRIVATE_KEY,
        MINT_CONTRACT_ADDRESS,
        [
          {
            to: MINT_RECIPIENT,
            quantity: BigInt(10),
          },
        ],
      );
      expect(txHash).not.toBe('');
    });
  });
});
