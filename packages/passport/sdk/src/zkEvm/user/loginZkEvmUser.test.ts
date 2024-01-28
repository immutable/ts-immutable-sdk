import { mockUser, mockUserZkEvm } from 'test/mocks';
import { PassportConfiguration } from 'config';
import { ImmutableConfiguration } from '@imtbl/config';
import { MultiRollupApiClients } from '@imtbl/generated-clients';
import { JsonRpcProvider } from '@ethersproject/providers';
import { loginZkEvmUser } from './loginZkEvmUser';
import AuthManager from '../../authManager';
import MagicAdapter from '../../magicAdapter';
import { registerZkEvmUser } from './registerZkEvmUser';

jest.mock('./registerZkEvmUser');

describe('loginZkEvmUser', () => {
  afterEach(jest.resetAllMocks);

  const getUserMock = jest.fn();
  const authLoginMock = jest.fn();
  const authManager = {
    getUser: getUserMock,
    login: authLoginMock,
  } as unknown as AuthManager;
  const magicProvider = {};
  const magicAdapter = {
    login: () => magicProvider,
  } as unknown as MagicAdapter;

  const config = new PassportConfiguration({
    baseConfig: {} as ImmutableConfiguration,
    clientId: 'client123',
    logoutRedirectUri: 'http://localhost:3000/logout',
    redirectUri: 'http://localhost:3000/redirect',
  });

  const multiRollupApiClients = { } as unknown as MultiRollupApiClients;

  it('should return a user that has registered with zkEvm', async () => {
    const result = await loginZkEvmUser({
      authManager,
      existingUser: mockUserZkEvm,
      config,
      magicAdapter,
      multiRollupApiClients,
      jsonRpcProvider: {} as JsonRpcProvider,
    });

    expect(result).toEqual({
      user: mockUserZkEvm,
      magicProvider,
    });
    expect(authManager.login).toBeCalledTimes(0);
    expect(registerZkEvmUser).toBeCalledTimes(0);
  });

  it('should register and return a user if the user has not registered with zkEvm', async () => {
    authLoginMock.mockResolvedValue(mockUser);
    (registerZkEvmUser as unknown as jest.Mock).mockResolvedValue(mockUserZkEvm);
    const result = await loginZkEvmUser({
      authManager,
      existingUser: null,
      config,
      magicAdapter,
      multiRollupApiClients,
      jsonRpcProvider: {} as JsonRpcProvider,
    });

    expect(result).toEqual({
      user: mockUserZkEvm,
      magicProvider,
    });
    expect(authManager.login).toBeCalledTimes(1);
    expect(registerZkEvmUser).toBeCalledTimes(1);
  });

  it('should returns a user that has invalid refresh token but login again', async () => {
    (authManager.login as unknown as jest.Mock).mockResolvedValue(mockUserZkEvm);
    const result = await loginZkEvmUser({
      authManager,
      existingUser: null,
      config,
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
