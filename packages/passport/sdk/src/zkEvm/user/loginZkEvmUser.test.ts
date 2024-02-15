import { mockUser, mockUserZkEvm } from 'test/mocks';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { JsonRpcProvider } from '@ethersproject/providers';
import { loginZkEvmUser } from './loginZkEvmUser';
import AuthManager from '../../authManager';
import MagicAdapter from '../../magicAdapter';
import { registerZkEvmUser } from './registerZkEvmUser';

jest.mock('./registerZkEvmUser');

describe('loginZkEvmUser', () => {
  afterEach(jest.resetAllMocks);

  const getUserOrLoginMock = jest.fn();
  const authManager = {
    getUserOrLogin: getUserOrLoginMock,
  } as unknown as AuthManager;
  const magicProvider = {};
  const magicAdapter = {
    login: () => magicProvider,
  } as unknown as MagicAdapter;

  const multiRollupApiClients = { } as unknown as MultiRollupApiClients;

  it('should return a user that has registered with zkEvm', async () => {
    getUserOrLoginMock.mockResolvedValue(mockUserZkEvm);
    const result = await loginZkEvmUser({
      authManager,
      magicAdapter,
      multiRollupApiClients,
      jsonRpcProvider: {} as JsonRpcProvider,
    });

    expect(result).toEqual({
      user: mockUserZkEvm,
      magicProvider,
    });
    expect(registerZkEvmUser).toBeCalledTimes(0);
  });

  it('should register and return a user if the user has not registered with zkEvm', async () => {
    getUserOrLoginMock.mockResolvedValue(mockUser);
    (registerZkEvmUser as unknown as jest.Mock).mockResolvedValue(mockUserZkEvm);
    const result = await loginZkEvmUser({
      authManager,
      magicAdapter,
      multiRollupApiClients,
      jsonRpcProvider: {} as JsonRpcProvider,
    });

    expect(result).toEqual({
      user: mockUserZkEvm,
      magicProvider,
    });
    expect(registerZkEvmUser).toBeCalledTimes(1);
  });

  it('should returns a user that has invalid refresh token but login again', async () => {
    (authManager.login as unknown as jest.Mock).mockResolvedValue(mockUserZkEvm);
    const result = await loginZkEvmUser({
      authManager,
      magicAdapter,
      multiRollupApiClients,
      jsonRpcProvider: {} as JsonRpcProvider,
    });

    expect(result).toEqual({
      user: mockUserZkEvm,
      magicProvider,
    });
    expect(authManager.login).toBeCalledTimes(1);
    expect(registerZkEvmUser).toBeCalledTimes(0);
  });
});
