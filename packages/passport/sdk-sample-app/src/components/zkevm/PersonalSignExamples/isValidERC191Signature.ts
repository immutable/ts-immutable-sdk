import { Provider } from '@imtbl/passport';
import { utils } from 'ethers';
import { isValidSignature } from '@/components/zkevm/SignatureValidation/utils';

const encodeMessageDigest = (payload: Uint8Array) => {
  const hash = utils.keccak256(payload);
  return utils.arrayify(hash);
};

const prefixEIP191Message = (message: string): Uint8Array => {
  const eip191prefix = utils.toUtf8Bytes('\x19Ethereum Signed Message:\n');
  const messageBytes = utils.toUtf8Bytes(message);

  return utils.concat([eip191prefix, utils.toUtf8Bytes(String(messageBytes.length)), messageBytes]);
};

export const isValidERC191Signature = async (
  address: string,
  payload: string,
  signature: string,
  zkEvmProvider: Provider,
) => {
  const prefixedPayload = prefixEIP191Message(payload);
  const digest = encodeMessageDigest(prefixedPayload);
  return isValidSignature(address, digest, signature, zkEvmProvider);
};
