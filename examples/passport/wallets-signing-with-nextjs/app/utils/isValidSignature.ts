// #doc passport-wallets-nextjs-sign-isvalidsignature

import { ethers } from 'ethers';
import { Provider } from '@imtbl/passport';

// https://eips.ethereum.org/EIPS/eip-1271#specification
// EIP-1271 states that `isValidSignature` must return the following value if the signature is valid
export const ERC_1271_MAGIC_VALUE = '0x1626ba7e';

export const isValidSignature = async (
  address: string, // The Passport wallet address returned from eth_requestAccounts
  digest: string | Uint8Array,
  signature: string,
  zkEvmProvider: Provider, // can be any provider, Passport or not
) => {
  const contract = new ethers.Contract(
    address,
    ['function isValidSignature(bytes32, bytes) public view returns (bytes4)'],
    new ethers.providers.Web3Provider(zkEvmProvider),
  );

  const isValidSignatureHex = await contract.isValidSignature(digest, signature);
  return isValidSignatureHex === ERC_1271_MAGIC_VALUE;
};
// #enddoc passport-wallets-nextjs-sign-eip712-isvalidsignature