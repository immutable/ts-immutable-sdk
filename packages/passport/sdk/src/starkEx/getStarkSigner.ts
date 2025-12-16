import {
  createStarkSigner,
  generateLegacyStarkPrivateKey,
  StarkSigner,
} from '@imtbl/x-client';
import { withPassportError, PassportErrorType } from '../errors/passportError';

type StarkMessageSigner = {
  getAddress(): Promise<string>;
  signMessage(message: string | Uint8Array): Promise<string>;
};

export const getStarkSigner = async (signer: StarkMessageSigner) => withPassportError<StarkSigner>(async () => {
  const privateKey = await generateLegacyStarkPrivateKey(signer);
  return createStarkSigner(privateKey);
}, PassportErrorType.WALLET_CONNECTION_ERROR);
