import { BigNumber } from 'ethers';
import { ExchangeType } from '../types/fiatRamp';
import {
  OnRampConfig, OnRampProviderFees, TRANSAK_API_BASE_URL, TRANSAK_PUBLISHABLE_KEY,
} from '../types';
import { CheckoutConfiguration } from '../config';

export interface FiatRampWidgetParams {
  exchangeType: ExchangeType;
  isPassport: boolean;
  walletAddress?: string;
  tokenAmount?: BigNumber;
  tokenSymbol?: string;
  email?: string;
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
    return ((await this.config.remote.getConfig('onramp')) as OnRampConfig)?.transak?.fees;
  }

  public async createWidgetUrl(params: FiatRampWidgetParams): Promise<string> {
    return this.getTransakWidgetUrl(params);
  }

  private getTransakWidgetUrl(params: FiatRampWidgetParams): string {
    let widgetUrl = `${TRANSAK_API_BASE_URL[this.config.environment]}?`;
    const transakPublishableKey = `apiKey=${TRANSAK_PUBLISHABLE_KEY[this.config.environment]}`;
    const zkevmNetwork = 'network=immutablezkevm';
    const defaultPaymentMethod = 'defaultPaymentMethod=credit_debit_card';
    const disableBankTransfer = 'disablePaymentMethods=sepa_bank_transfer,gbp_bank_transfer,'
      + 'pm_cash_app,pm_jwire,pm_paymaya,pm_bpi,pm_ubp,pm_grabpay,pm_shopeepay,pm_gcash,pm_pix,'
      + 'pm_astropay,pm_pse,inr_bank_transfer';
    const productsAvailed = 'productsAvailed=buy';
    const exchangeScreenTitle = 'exchangeScreenTitle=Buy';
    const themeColor = 'themeColor=0D0D0D';

    widgetUrl += `${transakPublishableKey}&`
      + `${zkevmNetwork}&`
      + `${defaultPaymentMethod}&`
      + `${disableBankTransfer}&`
      + `${productsAvailed}&`
      + `${exchangeScreenTitle}&`
      + `${themeColor}`;

    if (params.isPassport && params.email) {
      const encodedEmail = encodeURIComponent(params.email);
      widgetUrl += `&email=${encodedEmail}&isAutoFillUserData=true&disableWalletAddressForm=true`;
    }

    if (params.tokenAmount && params.tokenSymbol) {
      widgetUrl += `&defaultCryptoAmount=${params.tokenAmount}&cryptoCurrencyCode=${params.tokenSymbol}`;
    } else {
      widgetUrl += '&defaultCryptoCurrency=IMX';
    }

    if (params.walletAddress) {
      widgetUrl += `&walletAddress=${params.walletAddress}`;
    }

    return widgetUrl;
  }
}
