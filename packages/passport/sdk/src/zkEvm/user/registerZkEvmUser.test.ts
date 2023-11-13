import { ImmutableConfiguration } from '@imtbl/config';
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { signRaw } from '@imtbl/toolkit';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { PassportConfiguration } from 'config';
import { ChainName } from 'network/chains';
import { registerZkEvmUser } from './registerZkEvmUser';
import AuthManager from '../../authManager';
import { mockUser, mockUserZkEvm } from '../../test/mocks';

jest.mock('@ethersproject/providers');
jest.mock('@imtbl/toolkit');

describe('registerZkEvmUser', () => {
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
  const jsonRPCProvider = {
    ready: {
      chainId: 13472,
    },
  };
  const ethereumAddress = '0x3082e7c88f1c8b4e24be4a75dee018ad362d84d4';
  const ethereumSignature = '0xcc63b10814e3ab4b2dff6762a6712e40c23db00c11f2c54bcc699babdbf1d2bc3096fec623da4784fafb7f6da65338d91e3c846ef52e856c2f5f86c4cf10790900';
  const accessToken = 'accessToken123';
  const config = new PassportConfiguration({
    baseConfig: {} as ImmutableConfiguration,
    clientId: 'client123',
    logoutRedirectUri: 'http://localhost:3000/logout',
    redirectUri: 'http://localhost:3000/redirect',
  });

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

      await expect(async () => registerZkEvmUser({
        authManager: authManager as unknown as AuthManager,
        config,
        magicProvider,
        multiRollupApiClients: multiRollupApiClients as unknown as MultiRollupApiClients,
        accessToken,
        jsonRpcProvider: jsonRPCProvider as unknown as JsonRpcProvider,
      })).rejects.toThrow('Failed to create counterfactual address: Error: Internal server error');
    });
  });

  describe('when loginSilent fails to return a user', () => {
    it('should throw an error', async () => {
      multiRollupApiClients.passportApi.createCounterfactualAddress.mockResolvedValue({
        status: 201,
      });

      authManager.loginSilent.mockResolvedValue(null);

      await expect(async () => registerZkEvmUser({
        authManager: authManager as unknown as AuthManager,
        config,
        magicProvider,
        multiRollupApiClients: multiRollupApiClients as unknown as MultiRollupApiClients,
        accessToken,
        jsonRpcProvider: jsonRPCProvider as unknown as JsonRpcProvider,
      })).rejects.toThrow('Failed to refresh user details');
    });
  });

  describe('when loginSilent returns a user that has not registered with zkEvm', () => {
    it('should throw an error', async () => {
      multiRollupApiClients.passportApi.createCounterfactualAddress.mockResolvedValue({
        status: 201,
      });

      authManager.loginSilent.mockResolvedValue(mockUser);

      await expect(async () => registerZkEvmUser({
        authManager: authManager as unknown as AuthManager,
        config,
        magicProvider,
        multiRollupApiClients: multiRollupApiClients as unknown as MultiRollupApiClients,
        accessToken,
        jsonRpcProvider: jsonRPCProvider as unknown as JsonRpcProvider,
      })).rejects.toThrow('Failed to refresh user details');
    });
  });

  it('should return a user that has registered with zkEvm', async () => {
    multiRollupApiClients.passportApi.createCounterfactualAddress.mockResolvedValue({
      status: 201,
    });

    authManager.loginSilent.mockResolvedValue(mockUserZkEvm);

    const result = await registerZkEvmUser({
      authManager: authManager as unknown as AuthManager,
      config,
      magicProvider,
      multiRollupApiClients: multiRollupApiClients as unknown as MultiRollupApiClients,
      accessToken,
      jsonRpcProvider: jsonRPCProvider as unknown as JsonRpcProvider,
    });

    expect(result).toEqual(mockUserZkEvm);
    expect(multiRollupApiClients.passportApi.createCounterfactualAddress).toHaveBeenCalledWith({
      chainName: ChainName.IMTBL_ZKEVM_TESTNET,
      createCounterfactualAddressRequest: {
        ethereum_address: ethereumAddress,
        ethereum_signature: ethereumSignature,
      },
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    expect(authManager.loginSilent).toHaveBeenCalledWith({ forceRefresh: true });
  });
});
