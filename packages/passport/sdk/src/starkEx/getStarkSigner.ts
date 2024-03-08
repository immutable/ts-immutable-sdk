import { Signer } from 'ethers';
import { createStarkSigner } from '@imtbl/core-sdk';
import {
  generateLegacyStarkPrivateKey,
  StarkSigner,
} from '@imtbl/x-client';
import { withPassportError, PassportErrorType } from '../errors/passportError';

export const getStarkSigner = async (signer: Signer) => withPassportError<StarkSigner>(async () => {
  const privateKey = await generateLegacyStarkPrivateKey(signer);
  return createStarkSigner(privateKey);
}, PassportErrorType.WALLET_CONNECTION_ERROR);
