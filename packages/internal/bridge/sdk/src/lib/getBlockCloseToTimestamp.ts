import { ethers } from 'ethers';

export async function getBlockNumberClosestToTimestamp(provider: ethers.providers.Provider, targetTimestamp: number, blockTime: number, clockInaccuracy: number): Promise<number> {
  let lowerBlockNumber = 0;
  let upperBlockNumber = await provider.getBlockNumber();
  // eslint-disable-next-line no-console
  console.log(`Latest block is ${upperBlockNumber}`);

  while (upperBlockNumber !== lowerBlockNumber + 1) {
    const midBlockNumber = Math.floor((lowerBlockNumber + upperBlockNumber) / 2);
    // eslint-disable-next-line no-await-in-loop
    const midBlock = await provider.getBlock(midBlockNumber);

    // targetTimestamp - midBlock.timestamp > maxTimeDiff && < maxTimeDiff * 2
    const timeDifference = targetTimestamp - midBlock.timestamp;

    if (timeDifference > clockInaccuracy && timeDifference < (blockTime + clockInaccuracy)) {
      // eslint-disable-next-line no-console
      console.log(`found midblock ${midBlockNumber}`);
      return midBlockNumber;
    } if (midBlock.timestamp < targetTimestamp) {
      // eslint-disable-next-line no-console
      console.log(`block ${midBlockNumber} is too low`);
      lowerBlockNumber = midBlockNumber;
    } else {
      // eslint-disable-next-line no-console
      console.log(`block ${midBlockNumber} is too high`);
      upperBlockNumber = midBlockNumber;
    }
  }
  return lowerBlockNumber;
}
