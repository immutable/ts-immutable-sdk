import { Environment } from '@imtbl/config';
import { ExchangeOverrides } from '@imtbl/dex-sdk';
import axios from 'axios';
import { CHECKOUT_API_BASE_URL } from '../types';

export type RemoteConfigParams = {
  environment: Environment;
};

export type RemoteConfigResult = {
  dex: {
    overrides?: ExchangeOverrides;
  };
};

export class RemoteConfig {
  private cache: any | null = null;

  private readonly environment: Environment;

  constructor({ environment }: RemoteConfigParams) {
    this.environment = environment;
  }

  async load(): Promise<RemoteConfigResult> {
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

    if (Object.keys(response.data?.dex?.overrides).length === 0) {
      this.cache = { dex: {} };
    } else {
      this.cache = response.data;
    }
    return this.cache;
  }
}
