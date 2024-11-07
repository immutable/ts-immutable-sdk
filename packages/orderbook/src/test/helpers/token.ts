import { hexlify, randomBytes } from "ethers";

export function getRandomTokenId(): string {
  return BigInt('0x' + hexlify(randomBytes(4))).toString(10);
}