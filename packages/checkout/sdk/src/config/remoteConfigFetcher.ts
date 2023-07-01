import axios from 'axios';
import { Environment } from '@imtbl/config';
import { CHECKOUT_API_BASE_URL, ENV_DEVELOPMENT } from '../types';
import { RemoteConfigParams, RemoteConfiguration } from './remoteConfigType';

export class RemoteConfigFetcher {
  private cache: RemoteConfiguration | undefined;

  private readonly isProduction: boolean;

  private readonly isDevelopment: boolean;

  constructor(params: RemoteConfigParams) {
    this.isDevelopment = params.isDevelopment;
    this.isProduction = params.isProduction;
  }

  private getEndpoint = () => {
    if (this.isDevelopment) return CHECKOUT_API_BASE_URL[ENV_DEVELOPMENT];
    if (this.isProduction) return CHECKOUT_API_BASE_URL[Environment.PRODUCTION];
    return CHECKOUT_API_BASE_URL[Environment.SANDBOX];
  };

  private async load(): Promise<RemoteConfiguration | undefined> {
    if (this.cache) return this.cache;

    let response;
    try {
      response = await axios.get(`${this.getEndpoint()}/v1/config`);
    } catch (error: any) {
      throw new Error(`Error fetching config: ${error.message}`);
    }

    if (response.status !== 200) {
      throw new Error(
        `Error fetching config: ${response.status} ${response.statusText}`,
      );
    }

    this.cache = response.data;

    return this.cache;
  }

  public async get(
    key?: keyof RemoteConfiguration,
  ): Promise<
    | RemoteConfiguration
    | RemoteConfiguration[keyof RemoteConfiguration]
    | undefined
    > {
    const config = await this.load();
    if (config && key) {
      return config[key] as RemoteConfiguration[keyof RemoteConfiguration];
    }
    return config as RemoteConfiguration;
  }
}
