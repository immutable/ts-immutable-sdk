import { Environment } from '@imtbl/config';
import { CheckoutConfiguration } from '../config';
import { RemoteConfigFetcher } from '../config/remoteConfigFetcher';
import { FiatRampService, FiatRampWidgetParams } from './fiatRamp';
import { ExchangeType, OnRampProvider } from '../types';
import { HttpClient } from '../api/http';

const defaultURL = 'https://global-stg.transak.com';
const defaultParams = {
  apiKey: 'mock-api-key',
  network: 'immutablezkevm',
  defaultPaymentMethod: 'credit_debit_card',
  disablePaymentMethods: '',
  productsAvailed: 'buy',
  exchangeScreenTitle: 'Buy',
  themeColor: '0D0D0D',
};

const defaultWidgetUrl = `${defaultURL}?${new URLSearchParams(
  defaultParams,
).toString()}`;

jest.mock('../config/remoteConfigFetcher');

describe('FiatRampService', () => {
  let config: CheckoutConfiguration;
  let fiatRampService: FiatRampService;
  let mockedHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
  });

  describe('feeEstimate', () => {
    it('should return transak fees', async () => {
      (RemoteConfigFetcher as unknown as jest.Mock).mockReturnValue({
        getConfig: jest.fn().mockResolvedValue({
          [OnRampProvider.TRANSAK]: {
            fees: {
              minPercentage: '3.5',
              maxPercentage: '5.5',
            },
          },
        }),
      });
      config = new CheckoutConfiguration(
        {
          baseConfig: {
            environment: Environment.SANDBOX,
          },
        },
        mockedHttpClient,
      );
      fiatRampService = new FiatRampService(config);

      const result = await fiatRampService.feeEstimate();
      expect(result).toEqual({
        minPercentage: '3.5',
        maxPercentage: '5.5',
        feePercentage: undefined,
      });
    });

    it('should return transak fees with feePercentage when feePercentage is defined', async () => {
      (RemoteConfigFetcher as unknown as jest.Mock).mockReturnValue({
        getConfig: jest.fn().mockResolvedValue({
          [OnRampProvider.TRANSAK]: {
            fees: {
              minPercentage: '3.5',
              maxPercentage: '5.5',
              feePercentage: '4.5',
            },
          },
        }),
      });
      config = new CheckoutConfiguration(
        {
          baseConfig: {
            environment: Environment.SANDBOX,
          },
        },
        mockedHttpClient,
      );
      fiatRampService = new FiatRampService(config);

      const result = await fiatRampService.feeEstimate();
      expect(result).toEqual({
        minPercentage: '3.5',
        maxPercentage: '5.5',
        feePercentage: '4.5',
      });
    });
  });

  describe('createWidgetUrl', () => {
    beforeEach(() => {
      (RemoteConfigFetcher as unknown as jest.Mock).mockReturnValue({
        getConfig: jest.fn().mockResolvedValue({
          [OnRampProvider.TRANSAK]: {
            publishableApiKey: 'mock-api-key',
          },
        }),
      });
      config = new CheckoutConfiguration(
        {
          baseConfig: {
            environment: Environment.SANDBOX,
          },
        },
        mockedHttpClient,
      );
      fiatRampService = new FiatRampService(config);
    });
    it(`should return widget url with non-configurable query params when onRampProvider is Transak' +
      'and default to IMX`, async () => {
      const params: FiatRampWidgetParams = {
        exchangeType: ExchangeType.ONRAMP,
        isPassport: false,
      };
      const result = await fiatRampService.createWidgetUrl(params);
      expect(result).toContain(defaultWidgetUrl);
      expect(result).toContain('&defaultCryptoCurrency=IMX');
      expect(result).not.toContain('&email=');
      expect(result).not.toContain(
        '&isAutoFillUserData=true&disableWalletAddressForm=true',
      );
      expect(result).not.toContain('&defaultCryptoAmount=');
      expect(result).not.toContain('&walletAddress=');
    });

    it(`should return widget url with encoded email, isAutoFillUserData and disableWalletAddressForm query params
    for passport users`, async () => {
      const params: FiatRampWidgetParams = {
        exchangeType: ExchangeType.ONRAMP,
        isPassport: true,
        email: 'passport.user@immutable.com',
      };
      const result = await fiatRampService.createWidgetUrl(params);
      expect(result).toContain(defaultWidgetUrl);
      expect(result).toContain('&email=passport.user%2540immutable.com');
      expect(result).toContain('&isAutoFillUserData=true');
      expect(result).toContain('&disableWalletAddressForm=true');
    });

    it(`should return widget url with defaultFiatAmount and defaultCryptoCurrency query params when tokenAmount and
    tokenSymbol are not present`, async () => {
      const params: FiatRampWidgetParams = {
        exchangeType: ExchangeType.ONRAMP,
        isPassport: false,
      };
      const result = await fiatRampService.createWidgetUrl(params);
      expect(result).toContain(defaultWidgetUrl);
      expect(result).toContain('&defaultFiatAmount=50');
      expect(result).toContain('&defaultCryptoCurrency=IMX');
      expect(result).not.toContain('&defaultCryptoAmount=100');
      expect(result).not.toContain('&cryptoCurrencyCode=ETH');
    });

    it(`should return widget url with defaultCryptoAmount and cryptoCurrencyCode query params when tokenAmount and
    tokenSymbol is present`, async () => {
      const params: FiatRampWidgetParams = {
        exchangeType: ExchangeType.ONRAMP,
        isPassport: false,
        tokenAmount: '100',
        tokenSymbol: 'ETH',
      };
      const result = await fiatRampService.createWidgetUrl(params);
      expect(result).toContain(defaultWidgetUrl);
      expect(result).toContain('&defaultCryptoAmount=100');
      expect(result).toContain('&cryptoCurrencyCode=ETH');
      expect(result).not.toContain('&defaultCryptoCurrency=IMX');
    });

    it('should return widget url with walletAddress query params when walletAddress is present', async () => {
      const params: FiatRampWidgetParams = {
        exchangeType: ExchangeType.ONRAMP,
        isPassport: false,
        walletAddress: '0x1234567890',
      };
      const result = await fiatRampService.createWidgetUrl(params);
      expect(result).toContain(defaultWidgetUrl);
      expect(result).toContain('&walletAddress=0x1234567890');
    });

    it('should return widget url with allowed crypto tokens in query params when allowed list is present', async () => {
      const params: FiatRampWidgetParams = {
        exchangeType: ExchangeType.ONRAMP,
        isPassport: false,
        allowedTokens: ['ETH', 'IMX'],
      };
      const result = await fiatRampService.createWidgetUrl(params);
      expect(result).toContain(defaultWidgetUrl);
      expect(result).toContain('&cryptoCurrencyList=eth%2Cimx');
    });
  });
});
