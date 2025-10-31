import { Environment } from '@imtbl/config';
import { AxiosResponse } from 'axios';
import { CheckoutConfiguration } from '../config';
import { RemoteConfigFetcher } from '../config/remoteConfigFetcher';
import { FiatRampService, FiatRampWidgetParams } from './fiatRamp';
import { ExchangeType, OnRampProvider } from '../types';
import { HttpClient } from '../api/http';

const defaultURL = 'https://global-stg.transak.com';
const SANDBOX_WIDGET_URL = 'https://api.sandbox.immutable.com/checkout/v1/widget-url';

jest.mock('../config/remoteConfigFetcher');

describe('FiatRampService', () => {
  let config: CheckoutConfiguration;
  let fiatRampService: FiatRampService;
  let mockedHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
    mockedHttpClient.post = jest.fn().mockResolvedValue({
      data: { url: defaultURL },
    } as AxiosResponse);
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
      const result = await fiatRampService.createWidgetUrl(params, mockedHttpClient);
      expect(result).toContain('https://global-stg.transak.com');
      expect(mockedHttpClient.post).toHaveBeenCalledWith(
        SANDBOX_WIDGET_URL,
        expect.objectContaining({
          default_crypto_currency: 'IMX',
        }),
        { method: 'POST' },
      );
    });

    it(`should return widget url with encoded email, isAutoFillUserData and disableWalletAddressForm query params
    for passport users`, async () => {
      const params: FiatRampWidgetParams = {
        exchangeType: ExchangeType.ONRAMP,
        isPassport: true,
        email: 'passport.user@immutable.com',
      };
      const result = await fiatRampService.createWidgetUrl(params, mockedHttpClient);
      expect(result).toContain('https://global-stg.transak.com');
      expect(mockedHttpClient.post).toHaveBeenCalledWith(
        SANDBOX_WIDGET_URL,
        expect.objectContaining({
          email: 'passport.user@immutable.com',
          is_auto_fill_user_data: true,
          disable_wallet_address_form: true,
        }),
        { method: 'POST' },
      );
    });

    it(`should return widget url with defaultFiatAmount and defaultCryptoCurrency query params when tokenAmount and
    tokenSymbol are not present`, async () => {
      const params: FiatRampWidgetParams = {
        exchangeType: ExchangeType.ONRAMP,
        isPassport: false,
      };
      const result = await fiatRampService.createWidgetUrl(params, mockedHttpClient);
      expect(result).toContain('https://global-stg.transak.com');
      expect(mockedHttpClient.post).toHaveBeenCalledWith(
        SANDBOX_WIDGET_URL,
        expect.objectContaining({
          default_fiat_amount: 50,
          default_crypto_currency: 'IMX',
        }),
        { method: 'POST' },
      );
    });

    it(`should return widget url with defaultCryptoAmount and cryptoCurrencyCode query params when tokenAmount and
    tokenSymbol is present`, async () => {
      const params: FiatRampWidgetParams = {
        exchangeType: ExchangeType.ONRAMP,
        isPassport: false,
        tokenAmount: '100',
        tokenSymbol: 'ETH',
      };
      const result = await fiatRampService.createWidgetUrl(params, mockedHttpClient);
      expect(result).toContain('https://global-stg.transak.com');
      expect(mockedHttpClient.post).toHaveBeenCalledWith(
        SANDBOX_WIDGET_URL,
        expect.objectContaining({
          default_crypto_amount: '100',
          crypto_currency_code: 'ETH',
        }),
        { method: 'POST' },
      );
    });

    it('should return widget url with walletAddress query params when walletAddress is present', async () => {
      const params: FiatRampWidgetParams = {
        exchangeType: ExchangeType.ONRAMP,
        isPassport: false,
        walletAddress: '0x1234567890',
      };
      const result = await fiatRampService.createWidgetUrl(params, mockedHttpClient);
      expect(result).toContain('https://global-stg.transak.com');
      expect(mockedHttpClient.post).toHaveBeenCalledWith(
        SANDBOX_WIDGET_URL,
        expect.objectContaining({
          wallet_address: '0x1234567890',
        }),
        { method: 'POST' },
      );
    });

    it('should return widget url with allowed crypto tokens in query params when allowed list is present', async () => {
      const params: FiatRampWidgetParams = {
        exchangeType: ExchangeType.ONRAMP,
        isPassport: false,
        allowedTokens: ['ETH', 'IMX'],
      };
      const result = await fiatRampService.createWidgetUrl(params, mockedHttpClient);
      expect(result).toContain('https://global-stg.transak.com');
      expect(mockedHttpClient.post).toHaveBeenCalledWith(
        SANDBOX_WIDGET_URL,
        expect.objectContaining({
          crypto_currency_list: 'eth,imx',
        }),
        { method: 'POST' },
      );
    });
  });
});
