import { Web3Provider } from '@ethersproject/providers';
import { signRaw } from '@imtbl/toolkit';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { createCounterfactualAddress } from './createCounterfactualAddress';
import AuthManager from '../../authManager';
import { mockUser, mockUserZkEvm } from '../../test/mocks';

jest.mock('@ethersproject/providers');
jest.mock('@imtbl/toolkit');

describe('createCounterFactualAddress', () => {
  const getSignerMock = jest.fn();
  const ethSignerMock = {
    getAddress: jest.fn(),
  };
  const authManager = {
    loginSilent: jest.fn(),
  };
  const magicProvider = {};
  const multiRollupApiClients = {
    passportApi: {
      createCounterfactualAddress: jest.fn(),
    },
  };
  const ethereumAddress = '0x3082e7c88f1c8b4e24be4a75dee018ad362d84d4';
  const ethereumSignature = '0xcc63b10814e3ab4b2dff6762a6712e40c23db00c11f2c54bcc699babdbf1d2bc3096fec623da4784fafb7f6da65338d91e3c846ef52e856c2f5f86c4cf10790900';
  const accessToken = 'accessToken123';

  beforeEach(() => {
    jest.restoreAllMocks();
    (Web3Provider as unknown as jest.Mock).mockImplementation(() => ({
      getSigner: getSignerMock,
    }));
    getSignerMock.mockReturnValue(ethSignerMock);
    ethSignerMock.getAddress.mockResolvedValue(ethereumAddress);
    (signRaw as jest.Mock).mockResolvedValue(ethereumSignature);
  });

  describe('when createCounterfactualAddress doesn\'t return a 201', () => {
    it('should throw an error', async () => {
      multiRollupApiClients.passportApi.createCounterfactualAddress.mockImplementation(() => {
        throw new Error('Internal server error');
      });

      await expect(async () => createCounterfactualAddress({
        authManager: authManager as unknown as AuthManager,
        magicProvider,
        multiRollupApiClients: multiRollupApiClients as unknown as MultiRollupApiClients,
        accessToken,
      })).rejects.toThrow('Failed to create counterfactual address: Error: Internal server error');
    });
  });

  describe('when loginSilent fails to return a user', () => {
    it('should throw an error', async () => {
      multiRollupApiClients.passportApi.createCounterfactualAddress.mockResolvedValue({
        status: 201,
      });

      authManager.loginSilent.mockResolvedValue(null);

      await expect(async () => createCounterfactualAddress({
        authManager: authManager as unknown as AuthManager,
        magicProvider,
        multiRollupApiClients: multiRollupApiClients as unknown as MultiRollupApiClients,
        accessToken,
      })).rejects.toThrow('Failed to refresh user details');
    });
  });

  describe('when loginSilent returns a user that has not registered with zkEvm', () => {
    it('should throw an error', async () => {
      multiRollupApiClients.passportApi.createCounterfactualAddress.mockResolvedValue({
        status: 201,
      });

      authManager.loginSilent.mockResolvedValue(mockUser);

      await expect(async () => createCounterfactualAddress({
        authManager: authManager as unknown as AuthManager,
        magicProvider,
        multiRollupApiClients: multiRollupApiClients as unknown as MultiRollupApiClients,
        accessToken,
      })).rejects.toThrow('Failed to refresh user details');
    });
  });

  it('should return a user that has registered with zkEvm', async () => {
    multiRollupApiClients.passportApi.createCounterfactualAddress.mockResolvedValue({
      status: 201,
    });

    authManager.loginSilent.mockResolvedValue(mockUserZkEvm);

    const result = await createCounterfactualAddress({
      authManager: authManager as unknown as AuthManager,
      magicProvider,
      multiRollupApiClients: multiRollupApiClients as unknown as MultiRollupApiClients,
      accessToken,
    });

    expect(result).toEqual(mockUserZkEvm);
    expect(multiRollupApiClients.passportApi.createCounterfactualAddress).toHaveBeenCalledWith({
      createCounterfactualAddressRequest: {
        ethereumAddress,
        ethereumSignature,
      },
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  });
});
