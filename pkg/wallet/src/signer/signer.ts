/**
 * Minimal signer interface for message signing
 * Compatible with ethers Signer, viem WalletClient, or custom implementations
 */
export interface Signer {
  /**
   * Gets the signer's address
   */
  getAddress(): Promise<string>;

  /**
   * Signs a message
   * @param message - Message to sign (string or Uint8Array bytes)
   * @returns Promise resolving to signature hex string
   */
  signMessage(message: string | Uint8Array): Promise<string>;

  /**
   * Signs typed data (for eth_signTypedData_v4)
   * Optional - if not provided, will use signMessage with hashed typed data
   */
  signTypedData?(domain: any, types: any, value: any): Promise<string>;
}
