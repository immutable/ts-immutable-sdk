import { Provider, TypedDataPayload } from '@imtbl/passport';
import { ethers } from 'ethers';

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
    [{
      type: 'function',
      name: 'isValidSignature',
      constant: true,
      inputs: [{ type: 'bytes32' }, { type: 'bytes' }],
      outputs: [{ type: 'bytes4' }],
      payable: false,
      stateMutability: 'view',
    }],
    new ethers.providers.Web3Provider(zkEvmProvider),
  );

  const isValidSignatureHex = await contract.isValidSignature(hash, signature);
  return isValidSignatureHex === '0x1626ba7e';
};
