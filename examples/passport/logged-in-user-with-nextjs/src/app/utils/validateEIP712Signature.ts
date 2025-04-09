import { verifyTypedData, getAddress, hashTypedData, createPublicClient, http } from 'viem';

// EIP-1271 defines this magic value for valid signatures
const ERC_1271_MAGIC_VALUE = '0x1626ba7e';

/**
 * Validates an EIP-712 signature from a standard EOA wallet
 * @param signerAddress The address that supposedly signed the message
 * @param typedData The typed data object that was signed
 * @param signature The signature to validate
 * @returns A promise that resolves to a boolean indicating if the signature is valid
 */
export const validateEIP712Signature = async (
  signerAddress: string,
  typedData: any,
  signature: string
): Promise<boolean> => {
  try {
    // Parse the typed data if it's provided as a string
    const typedDataObj = typeof typedData === 'string' ? JSON.parse(typedData) : typedData;
    
    // Extract the domain, types and message from the typedData
    const { domain, types, message, primaryType } = typedDataObj;
    
    // Make a copy of types and remove EIP712Domain as it's not needed for verification
    const typesCopy = { ...types };
    delete typesCopy.EIP712Domain;
    
    // Use viem to recover the address that signed the message
    const recoveredAddress = await verifyTypedData({
      address: signerAddress as `0x${string}`,
      domain,
      types: typesCopy,
      primaryType,
      message,
      signature: signature as `0x${string}`
    });
    
    // If verification returns true, the signature is valid
    return recoveredAddress;
  } catch (error) {
    console.error('Error validating EIP-712 signature:', error);
    return false;
  }
};

/**
 * Validates an EIP-712 signature using EIP-1271 standard for smart contract wallets
 * This is a simplified implementation - full implementation would use viem's 
 * multicall/smart contract read functions
 * 
 * @param signerAddress The contract wallet address
 * @param typedData The typed data object that was signed
 * @param signature The signature to validate
 * @param provider The Ethereum provider URL or object
 * @returns A promise that resolves to a boolean indicating if the signature is valid
 */
export const validateEIP712SignatureForContract = async (
  signerAddress: string,
  typedData: any,
  signature: string,
  provider: any
): Promise<boolean> => {
  try {
    // Parse the typed data if it's provided as a string
    const typedDataObj = typeof typedData === 'string' ? JSON.parse(typedData) : typedData;
    
    // Extract the domain, types and message from the typedData
    const { domain, types, message, primaryType } = typedDataObj;
    
    // Make a copy of types and remove EIP712Domain
    const typesCopy = { ...types };
    delete typesCopy.EIP712Domain;
    
    // Create the hash of the typed data using viem
    const digest = hashTypedData({
      domain,
      types: typesCopy,
      primaryType,
      message
    });
    
    // For EIP-1271 validation you would need to call the contract's isValidSignature method
    // This is a placeholder - you would need to use viem's contract interaction functions
    // or use the provider directly if it's a web3 provider
    console.log('Contract validation requires viem multicall implementation');
    console.log('Digest:', digest);
    console.log('Address:', signerAddress);
    console.log('Signature:', signature);
    
    // Mock implementation - in a real scenario you would call the contract
    // and check if the return value equals ERC_1271_MAGIC_VALUE
    return false;
  } catch (error) {
    console.error('Error validating EIP-712 signature via contract:', error);
    return false;
  }
};

/**
 * Comprehensive validator that tries both EOA and contract validation methods
 * @param signerAddress The address that supposedly signed the message
 * @param typedData The typed data object that was signed
 * @param signature The signature to validate
 * @param provider The Ethereum provider (required for contract validation)
 * @returns A promise that resolves to a boolean indicating if the signature is valid
 */
export const validateSignatureComprehensive = async (
  signerAddress: string,
  typedData: any,
  signature: string,
  provider?: any
): Promise<boolean> => {
  // First try standard EOA validation
  const isValidEOA = await validateEIP712Signature(signerAddress, typedData, signature);
  if (isValidEOA) return true;
  
  // If EOA validation fails and we have a provider, try contract validation
  if (provider) {
    return validateEIP712SignatureForContract(signerAddress, typedData, signature, provider);
  }
  
  return false;
};

/**
 * Validates if a provided address matches another address (case-insensitive)
 * @param address1 First address to compare
 * @param address2 Second address to compare
 * @returns Boolean indicating if addresses match
 */
export const isAddressEqual = (address1: string, address2: string): boolean => {
  try {
    // Use getAddress to normalize addresses to checksum format
    const normalizedAddress1 = getAddress(address1);
    const normalizedAddress2 = getAddress(address2);
    return normalizedAddress1 === normalizedAddress2;
  } catch {
    // If addresses can't be normalized, compare lowercase versions
    return address1.toLowerCase() === address2.toLowerCase();
  }
}; 