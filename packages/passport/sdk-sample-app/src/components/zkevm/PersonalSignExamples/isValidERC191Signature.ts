import { Provider } from '@imtbl/passport';
import { ethers } from 'ethers';
import { isValidSignature } from '@/components/zkevm/SignatureValidation/utils';

const encodeMessageDigest = (payload: string) => {
  const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(payload));
  return ethers.utils.arrayify(hash);
};

export const isValidERC191Signature = async (
  address: string,
  payload: string,
  signature: string,
  zkEvmProvider: Provider,
) => {
  const digest = encodeMessageDigest(payload);
  return isValidSignature(address, digest, signature, zkEvmProvider);
};
