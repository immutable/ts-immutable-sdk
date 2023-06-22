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
  const ethereumAddress = '0x3082e7c88f1c8b4e24be4a75dee018ad362d84d4';
  const ethereumSignature = '0x05107ba1d76d8a5ba3415df36eb5af65f4c670778eed257f5704edcb03802cfc662f66b76e5aa032c2305e61ce77ed858bc9850f8c945ab6c3cb6fec796aae421c';

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
      multiRollupApiClients.passportApi.createCounterfactualAddress.mockImplementation(() => {
        throw new Error('Internal server error');
      });

      await expect(async () => createCounterfactualAddress({
        authManager: authManager as unknown as AuthManager,
        magicProvider,
        multiRollupApiClients: multiRollupApiClients as unknown as MultiRollupApiClients,
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
