import axios from 'axios';
import { Environment } from '@imtbl/config';
import {
  ChainId,
  CHECKOUT_API_BASE_URL,
  ENV_DEVELOPMENT,
  RemoteConfiguration,
  TokenInfo,
} from '../types';
import { ConfiguredTokens, RemoteConfigParams } from './remoteConfigType';

export class RemoteConfigFetcher {
  private isDevelopment: boolean;

  private isProduction: boolean;

  private configCache: RemoteConfiguration | undefined;

  private tokensCache: ConfiguredTokens | undefined;

  constructor(params: RemoteConfigParams) {
    this.isDevelopment = params.isDevelopment;
    this.isProduction = params.isProduction;
  }

  private static async makeHttpRequest(url: string): Promise<any> {
    let response;

    try {
      response = await axios.get(url);
    } catch (error: any) {
      throw new Error(`Error fetching from api: ${error.message}`);
    }

    if (response.status !== 200) {
      throw new Error(
        `Error fetching from api: ${response.status} ${response.statusText}`,
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

    const response = await RemoteConfigFetcher.makeHttpRequest(`${this.getEndpoint()}/v1/config`);
    this.configCache = response.data;

    return this.configCache;
  }

  private async loadConfigTokens(): Promise<ConfiguredTokens | undefined> {
    if (this.tokensCache) return this.tokensCache;

    const response = await RemoteConfigFetcher.makeHttpRequest(`${this.getEndpoint()}/v1/config/tokens`);
    this.tokensCache = response.data;

    return this.tokensCache;
  }

  public async getConfig(
    key?: keyof RemoteConfiguration,
  ): Promise<RemoteConfiguration | RemoteConfiguration[keyof RemoteConfiguration] | undefined> {
    const config = await this.loadConfig();
    if (!config) return undefined;
    if (!key) return config;
    return config[key];
  }

  public async getTokens(
    chainId: ChainId,
  ): Promise<TokenInfo[]> {
    const config = await this.loadConfigTokens();
    if (!config) return [];
    return config[chainId]?.allowed ?? [];
  }
}
