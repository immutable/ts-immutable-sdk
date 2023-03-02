import { Signer } from 'ethers';
import {
  generateLegacyStarkPrivateKey,
  createStarkSigner,
  StarkSigner,
} from '@imtbl/core-sdk';
import { withPassportError, PassportErrorType } from '../errors/passportError';

export const getStarkSigner = async (
  signer: Signer,
): Promise<StarkSigner> => withPassportError<StarkSigner>(async () => {
  const privateKey = await generateLegacyStarkPrivateKey(signer);
  return createStarkSigner(privateKey);
}, { type: PassportErrorType.WALLET_CONNECTION_ERROR });
