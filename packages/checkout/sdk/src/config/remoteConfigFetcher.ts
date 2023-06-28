import { Environment } from '@imtbl/config';
import axios from 'axios';
import { ChainId, CHECKOUT_API_BASE_URL, TokenInfo } from '../types';
import { RemoteConfigParams, RemoteConfiguration } from './remoteConfigType';
import { ConfiguredTokens } from './configuredTokens';

export class RemoteConfigFetcher {
  private configCache: RemoteConfiguration | undefined;

  private tokensCache: ConfiguredTokens | undefined;

  private readonly environment: Environment;

  constructor(params: RemoteConfigParams) {
    this.environment = params.environment;
  }

  // eslint-disable-next-line class-methods-use-this
  private async makeHttpRequest(url: string): Promise<any> {
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

  private async loadConfig(): Promise<RemoteConfiguration | undefined> {
    if (this.configCache) return this.configCache;

    const response = await this.makeHttpRequest(
      `${CHECKOUT_API_BASE_URL[this.environment]}/v1/config`,
    );

    this.configCache = response.data;

    return this.configCache;
  }

  private async loadConfigTokens(): Promise<ConfiguredTokens | undefined> {
    if (this.tokensCache) return this.tokensCache;

    const response = await this.makeHttpRequest(
      `${CHECKOUT_API_BASE_URL[this.environment]}/v1/config/tokens`,
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
    if (config && key) {
      return config[key] as RemoteConfiguration[keyof RemoteConfiguration];
    }
    return config as RemoteConfiguration;
  }

  public async getTokens(chainId: ChainId): Promise<TokenInfo[]> {
    const config = await this.loadConfigTokens();
    if (config && config[chainId.toString()]?.allowed) {
      return config[chainId].allowed as TokenInfo[];
    }
    return [];
  }
}
