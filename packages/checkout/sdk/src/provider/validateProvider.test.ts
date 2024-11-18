import { Environment } from '@imtbl/config';
import { BrowserProvider, Eip1193Provider } from 'ethers';
import { isBrowserProvider, validateProvider } from './validateProvider';
import { ChainId, NamedBrowserProvider, WalletProviderName } from '../types';
import { CheckoutConfiguration } from '../config';
import { RemoteConfigFetcher } from '../config/remoteConfigFetcher';
import { HttpClient } from '../api/http';

jest.mock('../config/remoteConfigFetcher');

describe('provider validation', () => {
  const mockRequestFunc = (request: {
    method: string;
    params?: any[] | undefined;
  }): Promise<any> => Promise.resolve(() => {
    // eslint-disable-next-line no-console
    console.log(request);
  });

  describe('isBrowserProvider', () => {
    it('should return true when provider is BrowserProvider shape and request method is present', () => {
      const browserProvider = new BrowserProvider({ request: mockRequestFunc });
      const result = isBrowserProvider(browserProvider);

      expect(result).toBeTruthy();
    });

    it('should return false when it is not a BrowserProvider', () => {
      // pass in object which is not a BrowserProvider
      const browserProvider = {
        request: mockRequestFunc,
      } as unknown as BrowserProvider;
      const result = isBrowserProvider(browserProvider);

      expect(result).toBeFalsy();
    });
  });

  describe('validateProvider', () => {
    let underlyingProviderMock: Eip1193Provider;
    let testCheckoutConfig: CheckoutConfiguration;
    const requestMock = jest.fn();

    beforeEach(() => {
      underlyingProviderMock = {
        request: requestMock,
      };

      (RemoteConfigFetcher as unknown as jest.Mock).mockReturnValue({
        getConfig: jest.fn().mockResolvedValue([
          {
            chainId: ChainId.ETHEREUM,
          },
          {
            chainId: ChainId.SEPOLIA,
          },
          {
            chainId: ChainId.IMTBL_ZKEVM_TESTNET,
          },
        ]),
      });

      const mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
      testCheckoutConfig = new CheckoutConfiguration({
        baseConfig: { environment: Environment.PRODUCTION },
      }, mockedHttpClient);
    });

    it('should not throw an error when valid web3provider', async () => {
      requestMock.mockResolvedValue('0x1');
      const testBrowserProvider = new NamedBrowserProvider(
        'test' as WalletProviderName,
        underlyingProviderMock,
        ChainId.ETHEREUM,
      );
      expect(await validateProvider(testCheckoutConfig, testBrowserProvider)).toBe(
        testBrowserProvider,
      );
    });

    // eslint-disable-next-line max-len
    it('should throw an error if the underlying provider is not on the same network as the BrowserProvider', async () => {
      requestMock.mockResolvedValue('0x1');
      const testBrowserProvider = new NamedBrowserProvider(
        'test' as WalletProviderName,
        underlyingProviderMock,
        ChainId.IMTBL_ZKEVM_TESTNET,
      );
      await expect(
        validateProvider(testCheckoutConfig, testBrowserProvider),
      ).rejects.toThrowError(
        '[WEB3_PROVIDER_ERROR] Cause:Your wallet has changed network, please switch to a supported network',
      );
    });

    it('should not throw an error if allowMistmatchedChainId is true and underlying network different', async () => {
      requestMock.mockResolvedValue('0x1');
      const testBrowserProvider = new NamedBrowserProvider(
        'test' as WalletProviderName,
        underlyingProviderMock,
        ChainId.IMTBL_ZKEVM_TESTNET,
      );
      const validationOverrides = {
        allowMistmatchedChainId: true,
        allowUnsupportedProvider: false,
      };
      expect(
        await validateProvider(
          testCheckoutConfig,
          testBrowserProvider,
          validationOverrides,
        ),
      ).toBe(testBrowserProvider);
    });

    it('should throw an error if the underlying provider is on an unsupported network', async () => {
      requestMock.mockResolvedValue('0xfa');
      const testBrowserProvider = new NamedBrowserProvider(
        'test' as WalletProviderName,
        underlyingProviderMock,
        ChainId.ETHEREUM,
      );
      const validationOverrides = {
        allowMistmatchedChainId: true,
        allowUnsupportedProvider: false,
      };
      await expect(
        validateProvider(
          testCheckoutConfig,
          testBrowserProvider,
          validationOverrides,
        ),
      ).rejects.toThrowError(
        // eslint-disable-next-line max-len
        '[WEB3_PROVIDER_ERROR] Cause:Your wallet is connected to an unsupported network, please switch to a supported network',
      );
    });

    it('should not throw an error if allowUnsupportedProvider true and underlying network is unsupported', async () => {
      // HEX 0xfa -> 250 , underlying provider matches BrowserProvider, but unsupported chain
      requestMock.mockResolvedValue('0xfa');
      const testBrowserProvider = new NamedBrowserProvider(
        'test' as WalletProviderName,
        underlyingProviderMock,
        250,
      );
      const validationOverrides = {
        allowMistmatchedChainId: false,
        allowUnsupportedProvider: true,
      };
      expect(
        await validateProvider(
          testCheckoutConfig,
          testBrowserProvider,
          validationOverrides,
        ),
      ).toBe(testBrowserProvider);
    });
  });
});
