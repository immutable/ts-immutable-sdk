import { hexlify, randomBytes } from 'ethers';

export function getRandomTokenId(): string {
  return BigInt(`${hexlify(randomBytes(4))}`).toString(10);
}
