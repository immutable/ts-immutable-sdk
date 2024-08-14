import { act, renderHook } from '@testing-library/react-hooks/native';
import { Environment } from '@imtbl/config';
import React, { ReactNode } from 'react';
import { Passport, PassportModuleConfiguration } from '@imtbl/passport';
import { ZkEvmReactProvider, usePassport } from './PassportContext';

jest.mock('../Passport');
jest.mock('../zkEvm');
jest.mock('../zkEvm/provider/eip6963');
jest.mock('../authManager');

const mockPassport = Passport as jest.MockedClass<typeof Passport>;

describe('PassportContext and hooks', () => {
  const config: PassportModuleConfiguration = {
    baseConfig: {
      environment: Environment.SANDBOX,
    },
    clientId: 'clientId',
    redirectUri: 'redirectUri',
  };

  beforeEach(() => {
    mockPassport.mockClear();
  });

  it('should return a passport instance from context', () => {
    const { result } = renderHook(() => usePassport(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <ZkEvmReactProvider config={config}>
          {children}
        </ZkEvmReactProvider>
      ),
    });

    expect(result.current.passportInstance).toBeDefined();
  });

  it('should initialize context values', () => {
    const { result } = renderHook(() => usePassport(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <ZkEvmReactProvider config={config}>
          {children}
        </ZkEvmReactProvider>
      ),
    });

    expect(result.current.isLoggedIn).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.accounts).toEqual([]);
    expect(result.current.profile).toBe(null);
    expect(result.current.error).toBe(null);
    expect(result.current.passportProvider).toBe(null);
  });

  it('should login', async () => {
    const { result, waitFor } = renderHook(() => usePassport(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <ZkEvmReactProvider config={config}>
          {children}
        </ZkEvmReactProvider>
      ),
    });

    const accounts = ['0x1234'];

    (result.current.passportInstance.connectEvm as jest.Mock).mockReturnValue({
      request: () => Promise.resolve(accounts),
    });

    await act(() => result.current.login());

    expect(result.current.error).toBe(null);
    expect(result.current.isLoggedIn).toBe(true);
    waitFor(() => expect(result.current.accounts).toEqual(accounts));
    waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.passportProvider).toBeDefined();
  });

  it('should login without wallet', async () => {
    const { result, waitFor } = renderHook(() => usePassport(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <ZkEvmReactProvider config={config}>
          {children}
        </ZkEvmReactProvider>
      ),
    });

    const profile = {
      email: 'email',
      name: 'name',
    };

    (result.current.passportInstance.login as jest.Mock).mockReturnValue(Promise.resolve(profile));

    await act(() => result.current.login({
      withoutWallet: true,
    }));

    expect(result.current.error).toBe(null);
    expect(result.current.isLoggedIn).toBe(true);
    waitFor(() => expect(result.current.profile).toEqual(profile));
    waitFor(() => expect(result.current.isLoading).toBe(false));
    waitFor(() => expect(result.current.accounts).toBe([]));
  });

  it('should logout', async () => {
    const { result, waitFor } = renderHook(() => usePassport(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <ZkEvmReactProvider config={config}>
          {children}
        </ZkEvmReactProvider>
      ),
    });

    await act(() => result.current.logout());

    expect(result.current.error).toBe(null);
    expect(result.current.isLoggedIn).toBe(false);
    waitFor(() => expect(result.current.accounts).toEqual([]));
    waitFor(() => expect(result.current.profile).toBe(null));
    waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.passportProvider).toBe(null);
  });

  describe('usePassport', () => {
    it('should return the passport instance', () => {
      const { result } = renderHook(() => usePassport(), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <ZkEvmReactProvider config={config}>
            {children}
          </ZkEvmReactProvider>
        ),
      });

      expect(result.current.passportInstance).toBeDefined();
    });
  });
});
