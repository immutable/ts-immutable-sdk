import { BigNumber } from 'ethers';
import { Environment } from '@imtbl/config';
import { CryptoFiatExchangeService, CryptoFiatExchangeWidgetParams } from './cryptoFiatExchange';
import { ExchangeType } from '../types/cryptoFiatExchange';
import { CheckoutConfiguration } from '../config';
import { RemoteConfigFetcher } from '../config/remoteConfigFetcher';

const defaultWidgetUrl = 'https://global-stg.transak.com?apiKey=41ad2da7-ed5a-4d89-a90b-c751865effc2'
+ '&network=immutablezkevm&defaultPaymentMethod=credit_debit_card&disablePaymentMethods=sepa_bank_transfer,'
+ 'gbp_bank_transfer,pm_cash_app,pm_jwire,pm_paymaya,pm_bpi,pm_ubp,pm_grabpay,pm_shopeepay,pm_gcash,pm_pix,'
+ 'pm_astropay,pm_pse,inr_bank_transfer&productsAvailed=buy&exchangeScreenTitle=Buy&themeColor=0D0D0D';

jest.mock('../config/remoteConfigFetcher');

describe('cryptoFiatExchange', () => {
  let config: CheckoutConfiguration;
  let cryptoFiatExchangeService: CryptoFiatExchangeService;

  beforeEach(() => {
    config = new CheckoutConfiguration({
      baseConfig: {
        environment: Environment.SANDBOX,
      },
    });
    cryptoFiatExchangeService = new CryptoFiatExchangeService(config);
  });

  describe('feeEstimate', () => {
    it('should return transak fees', async () => {
      (RemoteConfigFetcher as unknown as jest.Mock).mockReturnValue({
        getConfig: jest.fn().mockResolvedValue({
          transak: {
            fees: {
              minPercentage: '3.5',
              maxPercentage: '5.5',
            },
          },
        }),
      });
      config = new CheckoutConfiguration({
        baseConfig: {
          environment: Environment.SANDBOX,
        },
      });
      cryptoFiatExchangeService = new CryptoFiatExchangeService(config);

      const result = await cryptoFiatExchangeService.feeEstimate();
      expect(result).toEqual({
        minPercentage: '3.5',
        maxPercentage: '5.5',
        feePercentage: undefined,
      });
    });

    it('should return transak fees with feePercentage when feePercentage is defined', async () => {
      (RemoteConfigFetcher as unknown as jest.Mock).mockReturnValue({
        getConfig: jest.fn().mockResolvedValue({
          transak: {
            fees: {
              minPercentage: '3.5',
              maxPercentage: '5.5',
              feePercentage: '4.5',
            },
          },
        }),
      });
      config = new CheckoutConfiguration({
        baseConfig: {
          environment: Environment.SANDBOX,
        },
      });
      cryptoFiatExchangeService = new CryptoFiatExchangeService(config);

      const result = await cryptoFiatExchangeService.feeEstimate();
      expect(result).toEqual({
        minPercentage: '3.5',
        maxPercentage: '5.5',
        feePercentage: '4.5',
      });
    });
  });

  describe('createWidgetUrl', () => {
    it('should return widget url with non-configurable query params when onRampProvider is Transak', async () => {
      const params: CryptoFiatExchangeWidgetParams = {
        exchangeType: ExchangeType.ONRAMP,
        isPassport: false,
      };
      const result = await cryptoFiatExchangeService.createWidgetUrl(params);
      expect(result).toContain(defaultWidgetUrl);
      expect(result).not.toContain('&email=');
      expect(result).not.toContain('&isAutoFillUserData=true&disableWalletAddressForm=true');
      expect(result).not.toContain('&defaultCryptoAmount=');
      expect(result).not.toContain('&cryptoCurrencyCode=');
      expect(result).not.toContain('&walletAddress=');
    });

    it(`should return widget url with encoded email, isAutoFillUserData and disableWalletAddressForm query params
    for passport users`, async () => {
      const params: CryptoFiatExchangeWidgetParams = {
        exchangeType: ExchangeType.ONRAMP,
        isPassport: true,
        email: 'passport.user@immutable.com',
      };
      const result = await cryptoFiatExchangeService.createWidgetUrl(params);
      expect(result).toContain(defaultWidgetUrl);
      expect(result).toContain('&email=passport.user%40immutable.com');
      expect(result).toContain('&isAutoFillUserData=true&disableWalletAddressForm=true');
    });

    it(`should return widget url with defaultCryptoAmount and cryptoCurrencyCode query params when tokenAmount and
    tokenSymbol is present`, async () => {
      const params: CryptoFiatExchangeWidgetParams = {
        exchangeType: ExchangeType.ONRAMP,
        isPassport: false,
        tokenAmount: BigNumber.from(100),
        tokenSymbol: 'ETH',
      };
      const result = await cryptoFiatExchangeService.createWidgetUrl(params);
      expect(result).toContain(defaultWidgetUrl);
      expect(result).toContain('&defaultCryptoAmount=100');
      expect(result).toContain('&cryptoCurrencyCode=ETH');
    });

    it('should return widget url with walletAddress query params when walletAddress is present', async () => {
      const params: CryptoFiatExchangeWidgetParams = {
        exchangeType: ExchangeType.ONRAMP,
        isPassport: false,
        walletAddress: '0x1234567890',
      };
      const result = await cryptoFiatExchangeService.createWidgetUrl(params);
      expect(result).toContain(defaultWidgetUrl);
      expect(result).toContain('&walletAddress=0x1234567890');
    });
  });
});
