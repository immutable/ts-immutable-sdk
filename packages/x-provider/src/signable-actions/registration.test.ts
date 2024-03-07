import { imx } from '@imtbl/generated-clients';
import { Contracts } from '@imtbl/x-client';
import { signRaw } from '@imtbl/toolkit';
import { AxiosError } from 'axios';
import { generateSigners, privateKey1, testConfig } from '../test/helpers';
import { isRegisteredOffchain, isRegisteredOnChain, registerOffchain } from './registration';

jest.mock('@imtbl/generated-clients');
jest.mock('@imtbl/x-client');
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
        isRegisteredOnChain('stark-key', signers.ethSigner, testConfig),
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
        isRegisteredOnChain('stark-key', signers.ethSigner, testConfig),
      ).rejects.toThrowError(err);
    });
  });

  describe('isRegisteredOffchain', () => {
    const getUsersMock = jest.fn();
    const ethAddress = '0x123';

    beforeEach(() => {
      jest.restoreAllMocks();

      (imx.UsersApi as jest.Mock).mockReturnValue({
        getUsers: getUsersMock,
      });
    });

    describe('when the user has registered with IMX', () => {
      test('should return true', async () => {
        getUsersMock.mockResolvedValue({
          data: {
            accounts: [ethAddress],
          },
        });

        const result = await isRegisteredOffchain(ethAddress, testConfig);

        expect(result).toEqual(true);
        expect(getUsersMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('when the user has not registered with IMX', () => {
      test('should return false', async () => {
        const axiosError = new AxiosError();
        axiosError.response = {
          config: axiosError.config!,
          data: undefined,
          headers: {},
          request: undefined,
          status: 404,
          statusText: '',
        };
        getUsersMock.mockImplementation(() => Promise.reject(axiosError));

        const result = await isRegisteredOffchain(ethAddress, testConfig);

        expect(result).toEqual(false);
        expect(getUsersMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('when getUsers throws an error that is not a 404', () => {
      test('should throw the error', async () => {
        const axiosResponse = new Error('oops');
        getUsersMock.mockImplementation(() => Promise.reject(axiosResponse));

        await expect(
          isRegisteredOffchain(ethAddress, testConfig),
        ).rejects.toThrowError(axiosResponse);

        expect(getUsersMock).toHaveBeenCalledTimes(1);
      });
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
      (imx.UsersApi as jest.Mock).mockReturnValue({
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
        getSignableRegistrationRequest,
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
