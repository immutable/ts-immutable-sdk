import { Provider, TypedDataPayload } from '@imtbl/passport';
import { TypedDataEncoder } from 'ethers';
import { isValidSignature } from '@/components/zkevm/SignatureValidation/utils';

export const isValidTypedDataSignature = async (
  address: string,
  payload: string,
  signature: string,
  zkEvmProvider: Provider,
) => {
  const typedPayload: TypedDataPayload = JSON.parse(payload);
  const types = { ...typedPayload.types };
  // @ts-ignore
  delete types.EIP712Domain;

  // eslint-disable-next-line no-underscore-dangle
  const digest = TypedDataEncoder.hash(
    typedPayload.domain,
    types,
    typedPayload.message,
  );
  return isValidSignature(address, digest, signature, zkEvmProvider);
};
