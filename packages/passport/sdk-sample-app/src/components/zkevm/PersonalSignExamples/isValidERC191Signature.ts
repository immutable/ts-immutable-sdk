import { Provider } from '@imtbl/passport';
import { isValidSignature } from '@/components/zkevm/SignatureValidation/utils';
import { hashMessage } from 'ethers';

export const isValidERC191Signature = async (
  address: string,
  payload: string,
  signature: string,
  zkEvmProvider: Provider,
) => {
  const digest = hashMessage(payload);

  return isValidSignature(address, digest, signature, zkEvmProvider);
};
