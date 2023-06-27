import { Environment } from '@imtbl/config';
import axios from 'axios';
import { ChainId, CHECKOUT_API_BASE_URL, TokenInfo } from '../types';
import {
  ConfiguredTokens,
  RemoteConfigParams,
  RemoteConfiguration,
} from './remoteConfigType';

export class RemoteConfigFetcher {
  private configCache: RemoteConfiguration | undefined;

  private tokensCache: ConfiguredTokens | undefined;

  private readonly environment: Environment;

  constructor(params: RemoteConfigParams) {
    this.environment = params.environment;
  }

  private async loadConfig(): Promise<RemoteConfiguration | undefined> {
    if (this.configCache) return this.configCache;

    let response;
    try {
      response = await axios.get(
        `${CHECKOUT_API_BASE_URL[this.environment]}/v1/config`,
      );
    } catch (error: any) {
      throw new Error(`Error fetching config: ${error.message}`);
    }

    if (response.status !== 200) {
      throw new Error(
        `Error fetching config: ${response.status} ${response.statusText}`,
      );
    }

    this.configCache = response.data;

    return this.configCache;
  }

  private async loadConfigTokens(): Promise<ConfiguredTokens | undefined> {
    if (this.tokensCache) return this.tokensCache;

    let response;
    try {
      response = await axios.get(
        `${CHECKOUT_API_BASE_URL[this.environment]}/v1/config/tokens`,
      );
    } catch (error: any) {
      throw new Error(`Error fetching configured tokens: ${error.message}`);
    }

    if (response.status !== 200) {
      throw new Error(
        `Error fetching configured tokens: ${response.status} ${response.statusText}`,
      );
    }

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

    if (key && config[key]) return config[key] as RemoteConfiguration[keyof RemoteConfiguration];

    return config as RemoteConfiguration;
  }

  public async getTokens(chainId: ChainId): Promise<TokenInfo[]> {
    const config = await this.loadConfigTokens();
    if (!config) return [];

    if (config[chainId]?.allowed) return config[chainId].allowed as TokenInfo[];
    if (config[chainId]?.metadata) return config[chainId].metadata as TokenInfo[];

    return [];
  }
}
