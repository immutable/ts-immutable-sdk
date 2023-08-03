import { ethers } from 'ethers';
import { getBlockNumberClosestToTimestamp } from './getBlockCloseToTimestamp';

describe('getBlockNumberClosestToTimestamp', () => {
  // default config for sdk
  const blockTime = 12;
  const clockInaccuracy = 900;
  const epochStartTime = 1_683_855_940;

  it('timestamp is after the latest block', async () => {
    const latestBlockNumber = 100_000_000_000;

    const targetTimestamp = (latestBlockNumber * blockTime) + epochStartTime + 100;

    const mockProvider = {
      getBlockNumber: jest.fn().mockResolvedValue(latestBlockNumber),
      getBlock: jest.fn().mockImplementation((blockNumber) => ({
        timestamp: (blockNumber * blockTime) + epochStartTime,
      })),
    };

    const closestBlockNumber = await getBlockNumberClosestToTimestamp(
      mockProvider as unknown as ethers.providers.Provider,
      targetTimestamp,
      blockTime,
      clockInaccuracy,
    );

    expect(closestBlockNumber).toBe(99_999_999_999);
  });

  it('timestamp is before the latest block', async () => {
    const latestBlockNumber = 100_000_000_000;

    const targetTimestamp = ((latestBlockNumber - 50_000_000_000) * blockTime) + epochStartTime;

    const mockProvider = {
      getBlockNumber: jest.fn().mockResolvedValue(latestBlockNumber),
      getBlock: jest.fn().mockImplementation((blockNumber) => ({
        timestamp: (blockNumber * blockTime) + epochStartTime,
      })),
    };

    const closestBlockNumber = await getBlockNumberClosestToTimestamp(
      mockProvider as unknown as ethers.providers.Provider,
      targetTimestamp,
      blockTime,
      clockInaccuracy,
    );

    expect(closestBlockNumber).toBe(49_999_999_999);
  });

  it('timestamp is before the first block', async () => {
    const latestBlockNumber = 100_000_000_000;

    const targetTimestamp = 0;

    const mockProvider = {
      getBlockNumber: jest.fn().mockResolvedValue(latestBlockNumber),
      getBlock: jest.fn().mockImplementation((blockNumber) => ({
        timestamp: (blockNumber * blockTime) + epochStartTime,
      })),
    };

    const closestBlockNumber = await getBlockNumberClosestToTimestamp(
      mockProvider as unknown as ethers.providers.Provider,
      targetTimestamp,
      blockTime,
      clockInaccuracy,
    );

    expect(closestBlockNumber).toBe(0);
  });
});
