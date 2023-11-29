import axios, { AxiosResponse } from 'axios';
import { Environment } from '@imtbl/config';
import {
  ChainId,
  ChainsTokensConfig,
  RemoteConfiguration,
  ChainTokensConfig,
} from '../types';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { CHECKOUT_API_BASE_URL, ENV_DEVELOPMENT } from '../env';

export type RemoteConfigParams = {
  isDevelopment: boolean;
  isProduction: boolean;
};

export class RemoteConfigFetcher {
  private isDevelopment: boolean;

  private isProduction: boolean;

  private configCache: RemoteConfiguration | undefined;

  private tokensCache: ChainsTokensConfig | undefined;

  private version: string = 'v1';

  constructor(params: RemoteConfigParams) {
    this.isDevelopment = params.isDevelopment;
    this.isProduction = params.isProduction;
  }

  private static async makeHttpRequest(url: string): Promise<AxiosResponse> {
    let response;

    try {
      response = await axios.get(url);
    } catch (error: any) {
      throw new CheckoutError(`Error fetching from api: ${error.message}`, CheckoutErrorType.API_ERROR);
    }

    if (response.status !== 200) {
      throw new CheckoutError(
        `Error fetching from api: ${response.status} ${response.statusText}`,
        CheckoutErrorType.API_ERROR,
      );
    }

    return response;
  }

  private getEndpoint = () => {
    if (this.isDevelopment) return CHECKOUT_API_BASE_URL[ENV_DEVELOPMENT];
    if (this.isProduction) return CHECKOUT_API_BASE_URL[Environment.PRODUCTION];
    return CHECKOUT_API_BASE_URL[Environment.SANDBOX];
  };

  private async loadConfig(): Promise<RemoteConfiguration | undefined> {
    if (this.configCache) return this.configCache;

    const response = await RemoteConfigFetcher.makeHttpRequest(
      `${this.getEndpoint()}/${this.version}/config`,
    );
    this.configCache = response.data;

    return this.configCache;
  }

  private async loadConfigTokens(): Promise<ChainsTokensConfig | undefined> {
    if (this.tokensCache) return this.tokensCache;

    const response = await RemoteConfigFetcher.makeHttpRequest(
      `${this.getEndpoint()}/${this.version}/config/tokens`,
    );
    this.tokensCache = response.data;

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
}
