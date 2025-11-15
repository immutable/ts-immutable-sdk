/**
 * Shared types for wallet package
 */

/**
 * EIP-712 Typed Data payload
 */
export interface TypedDataPayload {
  types: {
    EIP712Domain: Array<{ name: string; type: string }>;
    [key: string]: Array<{ name: string; type: string }>;
  };
  domain: {
    name?: string;
    version?: string;
    chainId?: number | string;
    verifyingContract?: string;
    salt?: string;
  };
  primaryType: string;
  message: Record<string, unknown>;
}
