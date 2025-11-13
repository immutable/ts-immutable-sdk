/**
 * ABI utility functions
 */

import { keccak256, toHex } from 'viem';

/**
 * Gets function selector from function signature
 * Replaces deprecated getFunctionSelector from viem
 * 
 * @param signature Function signature (e.g., 'transfer(address,uint256)')
 * @returns Function selector (first 4 bytes of keccak256 hash)
 */
export function getFunctionSelector(signature: string): `0x${string}` {
  return keccak256(toHex(signature)).slice(0, 10) as `0x${string}`;
}

