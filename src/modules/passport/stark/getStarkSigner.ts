import { Signer } from 'ethers';
import {
  generateLegacyStarkPrivateKey,
  createStarkSigner,
  StarkSigner,
} from '@imtbl/core-sdk';

export const getStartSigner = async (
  signer: Signer
): Promise<StarkSigner> => {
  const privateKey = await generateLegacyStarkPrivateKey(signer);
  return createStarkSigner(privateKey);
};
