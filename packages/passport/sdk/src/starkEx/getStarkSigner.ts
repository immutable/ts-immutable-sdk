import {
  createStarkSigner,
  generateLegacyStarkPrivateKey,
  StarkSigner,
} from '@imtbl/x-client';
import { Signer } from 'ethers-v5';
import { withPassportError, PassportErrorType } from '../errors/passportError';

export const getStarkSigner = async (signer: Signer) => withPassportError<StarkSigner>(async () => {
  const privateKey = await generateLegacyStarkPrivateKey(signer);
  return createStarkSigner(privateKey);
}, PassportErrorType.WALLET_CONNECTION_ERROR);
