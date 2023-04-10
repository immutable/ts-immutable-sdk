import { Signer } from 'ethers';
import { PassportErrorType, withPassportError } from '../errors/passportError';
import {
  createStarkSigner,
  generateLegacyStarkPrivateKey,
  StarkSigner,
} from '@imtbl/core-sdk';

export const getStarkSigner = async (signer: Signer): Promise<StarkSigner> => {
  return withPassportError<StarkSigner>(async () => {
    const priKey = await generateLegacyStarkPrivateKey(signer);
    const privateKey = Buffer.from(priKey, 'hex');
    return createStarkSigner(privateKey);
  }, PassportErrorType.WALLET_CONNECTION_ERROR);
};
