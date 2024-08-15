import { act, renderHook } from '@testing-library/react-hooks/native';
import { Environment } from '@imtbl/config';
import React, { ReactNode } from 'react';
import { Passport, PassportModuleConfiguration } from '@imtbl/passport';
import { ZkEvmReactProvider, usePassport } from './PassportContext';

jest.mock('@imtbl/passport');

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
    expect(result.current.error).toBe(null);
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
    waitFor(() => expect(result.current.isLoading).toBe(false));
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
