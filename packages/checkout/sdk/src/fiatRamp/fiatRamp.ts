import axios from 'axios';
import { ExchangeType } from '../types/fiatRamp';
import { OnRampConfig, OnRampProvider, OnRampProviderFees } from '../types';
import { CheckoutConfiguration } from '../config';
import { IMMUTABLE_API_BASE_URL } from '../env';

export interface FiatRampWidgetParams {
  exchangeType: ExchangeType;
  isPassport: boolean;
  walletAddress?: string;
  tokenAmount?: string;
  tokenSymbol?: string;
  email?: string;
  allowedTokens?: string[];
  showMenu?: boolean;
  customSubTitle?: string;
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

    const createWidgetUrl = `${IMMUTABLE_API_BASE_URL[this.config.environment]}/checkout/v1/widget-url`;
    let widgetParams: Record<string, any> = {
      api_key: onRampConfig[OnRampProvider.TRANSAK].publishableApiKey,
      network: 'immutablezkevm',
      default_payment_method: 'credit_debit_card',
      disable_payment_methods: '',
      products_availed: 'buy',
      exchange_screen_title: params.customSubTitle === '' ? ' ' : (params.customSubTitle ?? 'Buy'),
      theme_color: '0D0D0D',
      default_crypto_currency: params.tokenSymbol || 'IMX',
      hide_menu: !(params.showMenu ?? true),
    };

    if (params.isPassport && params.email) {
      widgetParams = {
        ...widgetParams,
        email: encodeURIComponent(params.email),
        is_auto_fill_user_data: true,
        disable_wallet_address_form: true,
      };
    }

    // NOTE: only set tokenAmount and tokenSymbol if you want a fixed pre-selected token with no currency selector
    // setting cryptoCurrencyCode code will force the user to buy that token, defaultCryptoAmount will not work without cryptoCurrencyCode
    // setting defaultFiatAmount/fiatAmount + defaultFiatCurrency will take a higher priority over defaultCryptoAmount + cryptoCurrencyCode
    if (params.tokenAmount && params.tokenSymbol) {
      widgetParams = {
        ...widgetParams,
        default_crypto_amount: params.tokenAmount,
        crypto_currency_code: params.tokenSymbol,
      };
    } else {
      widgetParams = {
        ...widgetParams,
        default_fiat_amount: 50,
        default_fiat_currency: 'usd',
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
        crypto_currency_list: params.allowedTokens?.join(',').toLowerCase(),
      };
    }

    const response = await axios.post(createWidgetUrl, widgetParams);
    return response.data.url;
  }
}
