import { Pool } from '@uniswap/v3-sdk';
import { ethers } from 'ethers';

export const quoteReturnMapping: { [signature: string]: string[] } = {
  '0xcdca1753': ['uint256', 'uint160[]', 'uint32[]', 'uint256'],
  '0xc6a5026a': ['uint256', 'uint160', 'uint32', 'uint256'],
  '0x2f80bb1d': ['uint256', 'uint160[]', 'uint32[]', 'uint256'],
  '0xbd21704a': ['uint256', 'uint160', 'uint32', 'uint256'],
};

/**
 * Returns true if poolA is equivalent to poolB
 * @param poolA one of the two pools
 * @param poolB the other pool
 */
export function poolEquals(poolA: Pool, poolB: Pool): boolean {
  return (
    poolA === poolB ||
    (poolA.token0.equals(poolB.token0) &&
      poolA.token1.equals(poolB.token1) &&
      poolA.fee === poolB.fee)
  );
}

export class InvalidAddress extends Error {
  constructor(msg: string) {
    super(msg);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidAddress.prototype);
  }
}

export class DuplicateAddress extends Error {
  constructor(msg: string) {
    super(msg);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, InvalidAddress.prototype);
  }
}

export async function getERC20Decimals(
  tokenAddress: string,
  provider: ethers.providers.Provider
): Promise<number> {
  const decimalsFunctionSig = ethers.utils.id('decimals()').substring(0, 10);
  return parseInt(
    await provider.call({
      to: tokenAddress,
      data: decimalsFunctionSig,
    }),
    16
  );
}

/**
 * Based on https://github.com/ethers-io/ethers.js/blob/main/src.ts/address/checks.ts#L51
 */
export function validateAddress(address: string) {
  try {
    ethers.utils.getAddress(address);
  } catch (error) {
    throw new InvalidAddress(`Address is not valid: ${address}`);
  }
}

export function validateDifferentAddresses(
  tokenInAddress: string,
  tokenOutAddress: string
) {
  if (
    tokenInAddress.toLocaleLowerCase() === tokenOutAddress.toLocaleLowerCase()
  ) {
    throw new DuplicateAddress(
      `tokenInAddress and tokenOutAddress should be different but got: ${tokenInAddress}, ${tokenOutAddress}`
    );
  }
}
