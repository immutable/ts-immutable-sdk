import { MagicTEESigner } from '@imtbl/wallet';
import {
  createStarkSigner,
  generateLegacyStarkPrivateKey,
  StarkSigner,
} from '@imtbl/x-client';
import { withPassportError, PassportErrorType } from '../errors/passportError';

export const getStarkSigner = async (signer: MagicTEESigner) => withPassportError<StarkSigner>(async () => {
  // MagicTEESigner implements the minimal Signer interface (getAddress, signMessage)
  // that generateLegacyStarkPrivateKey actually uses
  // @ts-ignore - MagicTEESigner matches the Signer interface expected by generateLegacyStarkPrivateKey
  const privateKey = await generateLegacyStarkPrivateKey(signer);
  return createStarkSigner(privateKey);
}, PassportErrorType.WALLET_CONNECTION_ERROR);
