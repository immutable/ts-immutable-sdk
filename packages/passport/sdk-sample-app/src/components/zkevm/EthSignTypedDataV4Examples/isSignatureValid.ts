import { Provider } from '@imtbl/passport';
import { ethers } from 'ethers';

export const isSignatureValid = async (
  address: string,
  payload: string,
  signature: string,
  zkEvmProvider: Provider,
) => {
  const typedDataPayload = JSON.parse(payload);
  const types = { ...typedDataPayload.types };
  // @ts-ignore
  delete types.EIP712Domain;

  // eslint-disable-next-line no-underscore-dangle
  const hash = ethers.utils._TypedDataEncoder.hash(
    typedDataPayload.domain,
    types,
    typedDataPayload.message,
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
