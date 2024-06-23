import { Provider } from '@imtbl/passport';
import { utils } from 'ethers';
import { isValidSignature } from '@/components/zkevm/SignatureValidation/utils';

export const isValidERC191Signature = async (
  address: string,
  payload: string,
  signature: string,
  zkEvmProvider: Provider,
) => {
  const digest = utils.hashMessage(payload);

  return isValidSignature(address, digest, signature, zkEvmProvider);
};
