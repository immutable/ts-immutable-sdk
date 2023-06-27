import { Environment } from '@imtbl/config';
import axios from 'axios';
import { CHECKOUT_API_BASE_URL } from '../types';
import { RemoteConfigParams, RemoteConfiguration } from './remoteConfigType';

export class RemoteConfigFetcher {
  private cache: RemoteConfiguration | undefined;

  private readonly environment: Environment;

  constructor(params: RemoteConfigParams) {
    this.environment = params.environment;
  }

  private async load(): Promise<RemoteConfiguration | undefined> {
    if (this.cache) return this.cache;

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
