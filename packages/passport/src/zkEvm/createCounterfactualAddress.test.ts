import { Web3Provider } from '@ethersproject/providers';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { createCounterfactualAddress } from './createCounterfactualAddress';
import AuthManager from '../authManager';
import { mockUser, mockUserWithEtherKey } from '../test/mocks';

jest.mock('@ethersproject/providers');

describe('createCounterFactualAddress', () => {
  const getSignerMock = jest.fn();
  const ethSignerMock = {
    getAddress: jest.fn(),
    signMessage: jest.fn(),
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
  const ethereumAddress = '0x123';
  const ethereumSignature = '0x456';

  beforeEach(() => {
    jest.restoreAllMocks();
    (Web3Provider as unknown as jest.Mock).mockImplementation(() => ({
      getSigner: getSignerMock,
    }));
    getSignerMock.mockReturnValue(ethSignerMock);
    ethSignerMock.getAddress.mockResolvedValue(ethereumAddress);
    ethSignerMock.signMessage.mockResolvedValue(ethereumSignature);
  });

  describe('when createCounterfactualAddress doesn\'t return a 201', () => {
    it('should throw an error', async () => {
      multiRollupApiClients.passportApi.createCounterfactualAddress.mockResolvedValue({
        status: 500,
        statusText: 'Internal server error',
      });

      await expect(async () => createCounterfactualAddress({
        authManager: authManager as unknown as AuthManager,
        magicProvider,
        multiRollupApiClients: multiRollupApiClients as unknown as MultiRollupApiClients,
      })).rejects.toThrow('Failed to create counterfactual address: Internal server error');
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
      })).rejects.toThrow('Failed to refresh user details');
    });
  });

  describe('when loginSilent returns a user without an etherKey', () => {
    it('should throw an error', async () => {
      multiRollupApiClients.passportApi.createCounterfactualAddress.mockResolvedValue({
        status: 201,
      });

      authManager.loginSilent.mockResolvedValue(mockUser);

      await expect(async () => createCounterfactualAddress({
        authManager: authManager as unknown as AuthManager,
        magicProvider,
        multiRollupApiClients: multiRollupApiClients as unknown as MultiRollupApiClients,
      })).rejects.toThrow('Failed to refresh user details');
    });
  });

  it('should return a user with an etherKey', async () => {
    multiRollupApiClients.passportApi.createCounterfactualAddress.mockResolvedValue({
      status: 201,
    });

    authManager.loginSilent.mockResolvedValue(mockUserWithEtherKey);

    const result = await createCounterfactualAddress({
      authManager: authManager as unknown as AuthManager,
      magicProvider,
      multiRollupApiClients: multiRollupApiClients as unknown as MultiRollupApiClients,
    });

    expect(result).toEqual(mockUserWithEtherKey);
    expect(multiRollupApiClients.passportApi.createCounterfactualAddress).toHaveBeenCalledWith({
      createCounterfactualAddressRequest: {
        ethereumAddress,
        ethereumSignature,
      },
    });
  });
});
