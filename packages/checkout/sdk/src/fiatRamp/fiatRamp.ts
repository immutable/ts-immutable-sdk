import { ExchangeType } from '../types/fiatRamp';
import { OnRampConfig, OnRampProvider, OnRampProviderFees } from '../types';
import { CheckoutConfiguration } from '../config';
import { TRANSAK_API_BASE_URL } from '../env';

export interface FiatRampWidgetParams {
  exchangeType: ExchangeType;
  isPassport: boolean;
  walletAddress?: string;
  tokenAmount?: string;
  tokenSymbol?: string;
  email?: string;
  allowedTokens?: string[];
}

export class FiatRampService {
  readonly config: CheckoutConfiguration;

  /**
   * Constructs a new instance of the FiatRampService class.
   * @param {CheckoutConfiguration} config - The config required for the FiatRampService.
   */
  constructor(config: CheckoutConfiguration) {
    this.config = config;
  }

  public async feeEstimate(): Promise<OnRampProviderFees> {
    const config = (await this.config.remote.getConfig(
      'onramp',
    )) as OnRampConfig;
    return config[OnRampProvider.TRANSAK]?.fees;
  }

  public async createWidgetUrl(params: FiatRampWidgetParams): Promise<string> {
    return await this.getTransakWidgetUrl(params);
  }

  private async getTransakWidgetUrl(
    params: FiatRampWidgetParams,
  ): Promise<string> {
    const onRampConfig = (await this.config.remote.getConfig(
      'onramp',
    )) as OnRampConfig;

    const widgetUrl = TRANSAK_API_BASE_URL[this.config.environment];
    let widgetParams: Record<string, any> = {
      apiKey: onRampConfig[OnRampProvider.TRANSAK].publishableApiKey,
      network: 'immutablezkevm',
      defaultPaymentMethod: 'credit_debit_card',
      disablePaymentMethods:
        'sepa_bank_transfer,gbp_bank_transfer,pm_cash_app,pm_jwire,pm_paymaya,'
        + 'pm_bpi,pm_ubp,pm_grabpay,pm_shopeepay,pm_gcash,pm_pix,pm_astropay,pm_pse,inr_bank_transfer',
      productsAvailed: 'buy',
      exchangeScreenTitle: 'Buy',
      themeColor: '0D0D0D',
      defaultCryptoCurrency: params.tokenSymbol || 'IMX',
    };

    if (params.isPassport && params.email) {
      widgetParams = {
        ...widgetParams,
        email: encodeURIComponent(params.email),
        isAutoFillUserData: true,
        disableWalletAddressForm: true,
      };
    }

    // NOTE: only set tokenAmount and tokenSymbol if you want a fixed pre-selected token with no currency selector
    // setting cryptoCurrencyCode code will force the user to buy that token, defaultCryptoAmount will not work without cryptoCurrencyCode
    // setting defaultFiatAmount/fiatAmount + defaultFiatCurrency will take a higher priority over defaultCryptoAmount + cryptoCurrencyCode
    if (params.tokenAmount && params.tokenSymbol) {
      widgetParams = {
        ...widgetParams,
        defaultCryptoAmount: params.tokenAmount,
        cryptoCurrencyCode: params.tokenSymbol,
      };
    }

    if (params.walletAddress) {
      widgetParams = {
        ...widgetParams,
        walletAddress: params.walletAddress,
      };
    }

    if (params.allowedTokens) {
      widgetParams = {
        ...widgetParams,
        cryptoCurrencyList: params.allowedTokens?.join(',').toLowerCase(),
      };
    }

    return `${widgetUrl}?${new URLSearchParams(widgetParams).toString()}`;
  }
}
