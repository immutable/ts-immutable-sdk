import { generateSigners, privateKey1, testConfig } from '../test/helpers';
import { Contracts, UsersApi } from '@imtbl/core-sdk';
import { signRaw } from '@imtbl/toolkit';
import { isRegisteredOnChain, registerOffchain } from './registration';

jest.mock('@imtbl/core-sdk');
jest.mock('@imtbl/toolkit');

describe('Registration', () => {
  describe('isRegisteredOnChain workflow', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    test('should check stark public key and not throw an error', async () => {
      const signers = await generateSigners(privateKey1);

      (Contracts.Registration.connect as jest.Mock).mockReturnValue({
        isRegistered: jest.fn().mockResolvedValue(true),
      });

      await expect(
        isRegisteredOnChain('stark-key', signers.ethSigner, testConfig)
      ).resolves.not.toThrowError(new Error('some err'));
    });

    test('should check stark public key and throw an error', async () => {
      const signers = await generateSigners(privateKey1);
      const err = new Error('some error');

      (Contracts.Registration.connect as jest.Mock).mockReturnValue({
        isRegistered: jest.fn().mockRejectedValue(() => {
          throw err;
        }),
      });
      await expect(
        isRegisteredOnChain('stark-key', signers.ethSigner, testConfig)
      ).rejects.toThrowError(err);
    });
  });

  describe('registerOffchain', () => {
    let getSignableRegistrationOffchainMock: jest.Mock;
    let registerUserMock: jest.Mock;
    const registerUserResponse = {
      tx_hash: 'tx_hash',
    };

    beforeEach(() => {
      jest.restoreAllMocks();

      const getSignableRegistrationResponse = {
        signable_message: 'signable',
        payload_hash: 'hash',
      };

      getSignableRegistrationOffchainMock = jest.fn().mockResolvedValue({
        data: getSignableRegistrationResponse,
      });
      registerUserMock = jest
        .fn()
        .mockResolvedValue({ data: registerUserResponse });
      (UsersApi as jest.Mock).mockReturnValue({
        getSignableRegistrationOffchain: getSignableRegistrationOffchainMock,
        registerUser: registerUserMock,
      });

      (signRaw as jest.Mock).mockReturnValue('raw-eth-signature');
    });

    test('should make the api requests with the correct params', async () => {
      const signers = await generateSigners(privateKey1);
      const ethKey = await signers.ethSigner.getAddress();
      const starkKey = await signers.starkSigner.getAddress();

      const getSignableRegistrationRequest = {
        ether_key: ethKey,
        stark_key: starkKey,
      };

      const response = await registerOffchain(signers, testConfig);
      expect(getSignableRegistrationOffchainMock).toHaveBeenCalledWith({
        getSignableRegistrationRequest: getSignableRegistrationRequest,
      });
      expect(registerUserMock).toHaveBeenCalledWith({
        registerUserRequest: {
          eth_signature: 'raw-eth-signature',
          ether_key: ethKey,
          stark_signature: await signers.starkSigner.signMessage('hash'),
          stark_key: starkKey,
        },
      });
      expect(response).toEqual(registerUserResponse);
    });
  });
});
