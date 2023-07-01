import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { isWeb3Provider, validateProvider } from './validateProvider';
import { ChainId } from '../types';
import { CheckoutConfiguration } from '../config';
import { RemoteConfigFetcher } from '../config/remoteConfigFetcher';

jest.mock('../config/remoteConfigFetcher');

describe('provider validation', () => {
  const mockRequestFunc = (request: {
    method: string;
    params?: any[] | undefined;
  }): Promise<any> => Promise.resolve(() => {
    // eslint-disable-next-line no-console
    console.log(request);
  });

  describe('isWeb3Provider', () => {
    it('should return true when provider is Web3Provider shape and request method is present', () => {
      const web3Provider = new Web3Provider({ request: mockRequestFunc });
      const result = isWeb3Provider(web3Provider);

      expect(result).toBeTruthy();
    });

    it('should return false when it is not a Web3Provider', () => {
      // pass in object which is not a Web3Provider
      const web3Provider = {
        request: mockRequestFunc,
      } as unknown as Web3Provider;
      const result = isWeb3Provider(web3Provider);

      expect(result).toBeFalsy();
    });
  });

  describe('validateProvider', () => {
    let underlyingProviderMock: ExternalProvider;
    let testCheckoutConfig: CheckoutConfiguration;
    const requestMock = jest.fn();

    beforeEach(() => {
      underlyingProviderMock = {
        request: requestMock,
      };

      (RemoteConfigFetcher as jest.Mock).mockReturnValue({
        get: jest.fn().mockResolvedValue([
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

      testCheckoutConfig = new CheckoutConfiguration({
        baseConfig: { environment: Environment.PRODUCTION },
      });
    });

    it('should not throw an error when valid web3provider', async () => {
      requestMock.mockResolvedValue('0x1');
      const testWeb3Provider = new Web3Provider(
        underlyingProviderMock,
        ChainId.ETHEREUM,
      );
      expect(await validateProvider(testCheckoutConfig, testWeb3Provider)).toBe(
        testWeb3Provider,
      );
    });

    it('should throw an error if the underlying provider is not on the same network as the Web3Provider', async () => {
      requestMock.mockResolvedValue('0x1');
      const testWeb3Provider = new Web3Provider(
        underlyingProviderMock,
        ChainId.IMTBL_ZKEVM_TESTNET,
      );
      await expect(
        validateProvider(testCheckoutConfig, testWeb3Provider),
      ).rejects.toThrowError(
        '[WEB3_PROVIDER_ERROR] Cause:Your wallet has changed network, please switch to a supported network',
      );
    });

    it('should not throw an error if allowMistmatchedChainId is true and underlying network different', async () => {
      requestMock.mockResolvedValue('0x1');
      const testWeb3Provider = new Web3Provider(
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
          testWeb3Provider,
          validationOverrides,
        ),
      ).toBe(testWeb3Provider);
    });

    it('should throw an error if the underlying provider is on an unsupported network', async () => {
      requestMock.mockResolvedValue('0xfa');
      const testWeb3Provider = new Web3Provider(
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
          testWeb3Provider,
          validationOverrides,
        ),
      ).rejects.toThrowError(
        // eslint-disable-next-line max-len
        '[WEB3_PROVIDER_ERROR] Cause:Your wallet is connected to an unsupported network, please switch to a supported network',
      );
    });

    it('should not throw an error if allowUnsupportedProvider true and underlying network is unsupported', async () => {
      // HEX 0xfa -> 250 , underlying provider matches Web3Provider, but unsupported chain
      requestMock.mockResolvedValue('0xfa');
      const testWeb3Provider = new Web3Provider(underlyingProviderMock, 250);
      const validationOverrides = {
        allowMistmatchedChainId: false,
        allowUnsupportedProvider: true,
      };
      expect(
        await validateProvider(
          testCheckoutConfig,
          testWeb3Provider,
          validationOverrides,
        ),
      ).toBe(testWeb3Provider);
    });
  });
});
