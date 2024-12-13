import { Environment } from '@imtbl/config';
import { Eip1193Provider } from 'ethers';
import { isWrappedBrowserProvider, validateProvider } from './validateProvider';
import { ChainId, WrappedBrowserProvider } from '../types';
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

  describe('isWrappedBrowserProvider', () => {
    it('should return true when provider is BrowserProvider shape and request method is present', () => {
      const browserProvider = new WrappedBrowserProvider({ request: mockRequestFunc });
      const result = isWrappedBrowserProvider(browserProvider);

      expect(result).toBeTruthy();
    });

    it('should return false when it is not a BrowserProvider', () => {
      // pass in object which is not a BrowserProvider
      const browserProvider = {
        request: mockRequestFunc,
      } as unknown as WrappedBrowserProvider;
      const result = isWrappedBrowserProvider(browserProvider);

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

    it('should not throw an error when valid WrappedBrowserProvider', async () => {
      requestMock.mockResolvedValue('0x1');
      const testBrowserProvider = new WrappedBrowserProvider(
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
      const testBrowserProvider = new WrappedBrowserProvider(
        underlyingProviderMock,
        ChainId.IMTBL_ZKEVM_TESTNET,
      );
      await expect(
        validateProvider(testCheckoutConfig, testBrowserProvider),
      ).rejects.toThrowError(
        // eslint-disable-next-line max-len
        '[WEB3_PROVIDER_ERROR] Cause:network changed: 13473 => 1  (event="changed", code=NETWORK_ERROR, version=6.13.4)',
      );
    });

    it('should not throw an error if allowMistmatchedChainId is true and underlying network different', async () => {
      requestMock.mockResolvedValue('0x1');
      const testBrowserProvider = new WrappedBrowserProvider(
        underlyingProviderMock,
        'any',
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
      const testBrowserProvider = new WrappedBrowserProvider(
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
        '[WEB3_PROVIDER_ERROR] Cause:network changed: 1 => 250  (event="changed", code=NETWORK_ERROR, version=6.13.4)',
      );
    });

    it('should not throw an error if allowUnsupportedProvider true and underlying network is unsupported', async () => {
      // HEX 0xfa -> 250 , underlying provider matches BrowserProvider, but unsupported chain
      requestMock.mockResolvedValue('0xfa');
      const testBrowserProvider = new WrappedBrowserProvider(
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
