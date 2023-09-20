import { Provider, TypedDataPayload } from '@imtbl/passport';
import { ethers } from 'ethers';

// https://eips.ethereum.org/EIPS/eip-1271#specification
// EIP-1271 states that `isValidSignature` must return the following value if the signature is valid
const ERC_1271_MAGIC_VALUE = '0x1626ba7e';

export const isSignatureValid = async (
  address: string,
  payload: TypedDataPayload,
  signature: string,
  zkEvmProvider: Provider,
) => {
  const types = { ...payload.types };
  // @ts-ignore
  delete types.EIP712Domain;

  // eslint-disable-next-line no-underscore-dangle
  const hash = ethers.utils._TypedDataEncoder.hash(
    payload.domain,
    types,
    payload.message,
  );
  const contract = new ethers.Contract(
    address,
    ['function isValidSignature(bytes32, bytes) public view returns (bytes4)'],
    new ethers.providers.Web3Provider(zkEvmProvider),
  );

  const isValidSignatureHex = await contract.isValidSignature(hash, signature);
  return isValidSignatureHex === ERC_1271_MAGIC_VALUE;
};
