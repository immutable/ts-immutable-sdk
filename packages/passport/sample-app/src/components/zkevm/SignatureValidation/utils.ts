import { BrowserProvider, ethers } from 'ethers';
import { Provider } from '@imtbl/passport';

// https://eips.ethereum.org/EIPS/eip-1271#specification
// EIP-1271 states that `isValidSignature` must return the following value if the signature is valid
export const ERC_1271_MAGIC_VALUE = '0x1626ba7e';

export const isValidSignature = async (
  address: string,
  digest: string | Uint8Array,
  signature: string,
  zkEvmProvider: Provider,
) => {
  const contract = new ethers.Contract(
    address,
    ['function isValidSignature(bytes32, bytes) public view returns (bytes4)'],
    new BrowserProvider(zkEvmProvider),
  );

  const isValidSignatureHex = await contract.isValidSignature(digest, signature);
  return isValidSignatureHex === ERC_1271_MAGIC_VALUE;
};
