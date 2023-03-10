import { Signer } from 'ethers';
import { withPassportError, PassportErrorType } from '../errors/passportError';
import {
  generateLegacyStarkPrivateKey,
  createStarkSigner,
  StarkSigner,
} from '@imtbl/core-sdk';

export const getStarkSigner = async (signer: Signer): Promise<StarkSigner> => {
  return withPassportError<StarkSigner>(async () => {
    const privateKey = await generateLegacyStarkPrivateKey(signer);
    return createStarkSigner(privateKey);
  }, PassportErrorType.WALLET_CONNECTION_ERROR);
};
