import { Environment } from '@imtbl/config';
import {
  ChainId,
  ChainsTokensConfig,
  RemoteConfiguration,
  ChainTokensConfig,
} from '../types';
import { CHECKOUT_CDN_BASE_URL, ENV_DEVELOPMENT } from '../env';
import { HttpClient } from '../api/http';

export type RemoteConfigParams = {
  isDevelopment: boolean;
  isProduction: boolean;
};

export class RemoteConfigFetcher {
  private httpClient: HttpClient;

  private isDevelopment: boolean;

  private isProduction: boolean;

  private configCache: RemoteConfiguration | undefined;

  private tokensCache: ChainsTokensConfig | undefined;

  private version: string = 'v1';

  constructor(httpClient: HttpClient, params: RemoteConfigParams) {
    this.isDevelopment = params.isDevelopment;
    this.isProduction = params.isProduction;
    this.httpClient = httpClient;
  }

  private getEndpoint = () => {
    if (this.isDevelopment) return CHECKOUT_CDN_BASE_URL[ENV_DEVELOPMENT];
    if (this.isProduction) return CHECKOUT_CDN_BASE_URL[Environment.PRODUCTION];
    return CHECKOUT_CDN_BASE_URL[Environment.SANDBOX];
  };

  // eslint-disable-next-line class-methods-use-this
  private parseResponse<T>(response: AxiosResponse<any, any>): T {
    let responseData: T = response.data;
    if (response.data && typeof response.data !== 'object') {
      try {
        responseData = JSON.parse(response.data);
      } catch (jsonError) {
        throw new CheckoutError('Invalid configuration', CheckoutErrorType.API_ERROR);
      }
    }

    return responseData!;
  }

  private async loadConfig(): Promise<RemoteConfiguration | undefined> {
    if (this.configCache) return this.configCache;

    const response = await this.httpClient.get(
      `${this.getEndpoint()}/${this.version}/config`,
    );

    // Ensure that the configuration is valid
    this.configCache = this.parseResponse<RemoteConfiguration>(response);

    return this.configCache;
  }

  private async loadConfigTokens(): Promise<ChainsTokensConfig | undefined> {
    if (this.tokensCache) return this.tokensCache;

    const response = await this.httpClient.get(
      `${this.getEndpoint()}/${this.version}/config/tokens`,
    );

    // Ensure that the configuration is valid
    this.tokensCache = this.parseResponse<ChainsTokensConfig>(response);

    return this.tokensCache;
  }

  public async getConfig(
    key?: keyof RemoteConfiguration,
  ): Promise<
    | RemoteConfiguration
    | RemoteConfiguration[keyof RemoteConfiguration]
    | undefined
    > {
    const config = await this.loadConfig();
    if (!config) return undefined;
    if (!key) return config;
    return config[key];
  }

  public async getTokensConfig(chainId: ChainId): Promise<ChainTokensConfig> {
    const config = await this.loadConfigTokens();
    if (!config || !config[chainId]) return {};
    return config[chainId] ?? [];
  }

  public getHttpClient = () => this.httpClient;
}
