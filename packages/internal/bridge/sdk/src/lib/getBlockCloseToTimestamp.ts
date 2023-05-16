import { ethers } from 'ethers';

export async function getBlockNumberClosestToTimestamp(provider: ethers.providers.Provider, targetTimestamp: number, blockTime: number, clockInaccuracy: number): Promise<number> {
  let lowerBlockNumber = 0;
  let upperBlockNumber = await provider.getBlockNumber();

  while (upperBlockNumber !== lowerBlockNumber + 1) {
    const midBlockNumber = Math.floor((lowerBlockNumber + upperBlockNumber) / 2);
    // This is a valid use case to disable as results depend on previous results
    // eslint-disable-next-line no-await-in-loop
    const midBlock = await provider.getBlock(midBlockNumber);
    const timeDifference = targetTimestamp - midBlock.timestamp;
    if (timeDifference > clockInaccuracy && timeDifference < (blockTime + clockInaccuracy)) {
      return midBlockNumber;
    } if (midBlock.timestamp < targetTimestamp) {
      lowerBlockNumber = midBlockNumber;
    } else {
      upperBlockNumber = midBlockNumber;
    }
  }
  return lowerBlockNumber;
}
