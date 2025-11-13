/**
 * Chain-related utility functions
 */

/**
 * Gets EIP-155 chain ID format (eip155:chainId)
 */
export function getEip155ChainId(chainId: number): string {
  return `eip155:${chainId}`;
}

