/*
 * @jest-environment jsdom
 */
import { Web3Provider } from '@ethersproject/providers';
import { Passport } from '@imtbl/passport';
import { CheckoutErrorType } from '../errors';
import { WalletProviderName } from '../types';
import { createProvider } from './provider';
import { InjectedProvidersManager } from './injectedProvidersManager';

jest.mock('./injectedProvidersManager', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  InjectedProvidersManager: {
    getInstance: jest.fn(),
  },
}));

let windowSpy: any;

describe('createProvider', () => {
  const providerRequestMock: jest.Mock = jest.fn();
  const mockFindProvider = jest.fn().mockReturnValue(null);
  const mockWeb3Provider: Web3Provider = new Web3Provider({
    request: jest.fn(),
  });

  // const originalGetInstance = InjectedProvidersManager.getInstance;

  beforeEach(() => {
    windowSpy = jest.spyOn(window, 'window', 'get');
    windowSpy.mockImplementation(() => ({
      ethereum: {
        request: providerRequestMock,
      },
      removeEventListener: () => {},
    }));

    jest.spyOn(console, 'error').mockImplementation(() => {});

    mockFindProvider.mockReturnValue(null);
    jest.spyOn(InjectedProvidersManager as any, 'getInstance')
      .mockImplementation(() => ({
        findProvider: mockFindProvider,
      }));
  });

  afterEach(() => {
    windowSpy.mockRestore();
    jest.resetAllMocks();
  });

  it('should create a provider for Passport with a valid passport instance', async () => {
    const mockPassport = { connectEvm: jest.fn(() => mockWeb3Provider) } as unknown as Passport;
    const result = await createProvider(WalletProviderName.PASSPORT, mockPassport);

    expect(result.provider).toBeInstanceOf(Web3Provider);
    expect(result.walletProviderName).toBe(WalletProviderName.PASSPORT);
    expect(mockPassport.connectEvm).toHaveBeenCalled();
  });

  it('should create a provider for Passport when Passport is injected via EIP-6963', async () => {
    mockFindProvider.mockReturnValue({ provider: mockWeb3Provider });
    const result = await createProvider(WalletProviderName.PASSPORT);

    expect(result.provider).toBeInstanceOf(Web3Provider);
    expect(result.walletProviderName).toBe(WalletProviderName.PASSPORT);
  });

  it('should create a provider for Metamask when Metamask is injected via EIP-6963', async () => {
    mockFindProvider.mockReturnValue({ provider: mockWeb3Provider });
    const result = await createProvider(WalletProviderName.METAMASK);

    expect(result.provider).toBeInstanceOf(Web3Provider);
    expect(result.walletProviderName).toBe(WalletProviderName.METAMASK);
  });

  it('should throw an error if connect is called with a preference that is not expected', async () => {
    try {
      await createProvider('trust-wallet' as WalletProviderName);
    } catch (err: any) {
      expect(err.message).toEqual('Provider not supported');
      expect(err.type).toEqual(CheckoutErrorType.DEFAULT_PROVIDER_ERROR);
    }
  });

  it('should throw an error if metamask provider is not found', async () => {
    windowSpy.mockImplementation(() => ({
      removeEventListener: () => {},
    }));

    try {
      await createProvider(WalletProviderName.METAMASK);
    } catch (err: any) {
      expect(err.message).toEqual('[METAMASK_PROVIDER_ERROR] Cause:window.addEventListener is not a function');
      expect(err.type).toEqual(CheckoutErrorType.METAMASK_PROVIDER_ERROR);
    }
  });

  it('should throw an error if provider.request is not found', async () => {
    windowSpy.mockImplementation(() => ({
      ethereum: {},
      removeEventListener: () => {},
    }));

    try {
      await createProvider(WalletProviderName.METAMASK);
    } catch (err: any) {
      expect(err.message).toEqual('No MetaMask provider installed.');
      expect(err.type).toEqual(CheckoutErrorType.METAMASK_PROVIDER_ERROR);
    }
  });
});
