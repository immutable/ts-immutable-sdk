import {
  createStarkSigner,
  generateLegacyStarkPrivateKey,
} from '@imtbl/x-client';
import { ethers } from 'ethers';
import { getStarkSigner } from './getStarkSigner';
import { PassportError, PassportErrorType } from '../errors/passportError';

jest.mock('@imtbl/x-client');

describe('getStarkSigner', () => {
  const privateKey = '0x610855bbd7dad4efa59587e97041baa5ec96d483cac2ae78f2c2fb124fc391c1';
  const wallet = new ethers.Wallet(privateKey);

  it('should call generateLegacyStarkPrivateKey and return createStarkSigner', async () => {
    const privKey = 'private_key_123';
    const starkSigner = {};

    (generateLegacyStarkPrivateKey as jest.Mock).mockReturnValue(privKey);
    (createStarkSigner as jest.Mock).mockReturnValue(starkSigner);

    const result = await getStarkSigner(wallet);

    expect(generateLegacyStarkPrivateKey).toHaveBeenCalledWith(wallet);
    expect(createStarkSigner).toHaveBeenCalledWith(privKey);
    expect(result).toEqual(starkSigner);
  });

  it('should return a PassportError when an error is thrown', async () => {
    const errorMessage = 'oops';
    (generateLegacyStarkPrivateKey as jest.Mock).mockImplementation(() => {
      throw new Error(errorMessage);
    });
    await expect(async () => {
      await getStarkSigner(wallet);
    }).rejects.toThrow(
      new PassportError(
        errorMessage,
        PassportErrorType.WALLET_CONNECTION_ERROR,
      ),
    );
  });
});
