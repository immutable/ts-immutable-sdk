import { ExchangeType } from '../types/fiatRamp';
import {
  OnRampConfig, OnRampProvider, OnRampProviderFees,
} from '../types';
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
    const config = (await this.config.remote.getConfig('onramp')) as OnRampConfig;
    return config[OnRampProvider.TRANSAK]?.fees;
  }

  public async createWidgetUrl(params: FiatRampWidgetParams): Promise<string> {
    return (await this.getTransakWidgetUrl(params));
  }

  private async getTransakWidgetUrl(params: FiatRampWidgetParams): Promise<string> {
    let widgetUrl = `${TRANSAK_API_BASE_URL[this.config.environment]}?`;
    const onRampConfig = (await this.config.remote.getConfig('onramp')) as OnRampConfig;
    const apiKey = onRampConfig[OnRampProvider.TRANSAK].publishableApiKey;
    const transakPublishableKey = `apiKey=${apiKey}`;
    const zkevmNetwork = 'network=immutablezkevm';
    const defaultPaymentMethod = 'defaultPaymentMethod=credit_debit_card';
    const disableBankTransfer = 'disablePaymentMethods=sepa_bank_transfer,gbp_bank_transfer,'
      + 'pm_cash_app,pm_jwire,pm_paymaya,pm_bpi,pm_ubp,pm_grabpay,pm_shopeepay,pm_gcash,pm_pix,'
      + 'pm_astropay,pm_pse,inr_bank_transfer';
    const productsAvailed = 'productsAvailed=buy';
    const exchangeScreenTitle = 'exchangeScreenTitle=Buy';
    const themeColor = 'themeColor=0D0D0D';
    const defaultFiat = 'defaultFiatAmount=50&defaultFiatCurrency=usd';

    widgetUrl += `${transakPublishableKey}&`
      + `${zkevmNetwork}&`
      + `${defaultPaymentMethod}&`
      + `${disableBankTransfer}&`
      + `${productsAvailed}&`
      + `${exchangeScreenTitle}&`
      + `${themeColor}&`
      + `${defaultFiat}`;
    if (params.isPassport && params.email) {
      const encodedEmail = encodeURIComponent(params.email);
      widgetUrl += `&email=${encodedEmail}&isAutoFillUserData=true&disableWalletAddressForm=true`;
    }

    if (params.tokenAmount && params.tokenSymbol) {
      widgetUrl += `&defaultCryptoAmount=${params.tokenAmount}&defaultCryptoCurrency=${params.tokenSymbol}`;
    } else {
      widgetUrl += '&defaultCryptoCurrency=IMX';
    }

    if (params.walletAddress) {
      widgetUrl += `&walletAddress=${params.walletAddress}`;
    }

    if (params.allowedTokens) {
      widgetUrl += `&cryptoCurrencyList=${params.allowedTokens?.join(',').toLowerCase()}`;
    }

    return widgetUrl;
  }
}
