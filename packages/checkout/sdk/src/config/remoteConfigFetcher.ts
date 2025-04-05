import { AxiosResponse } from 'axios';
import { RemoteConfiguration } from '../types';
import { HttpClient } from '../api/http';
import { CheckoutError, CheckoutErrorType } from '../errors';

export class RemoteConfigFetcher {
  private httpClient: HttpClient;

  private endpoint: string;

  private configCache: RemoteConfiguration | undefined;

  private version: string = 'v1';

  constructor(httpClient: HttpClient, endpoint: string) {
    this.httpClient = httpClient;
    this.endpoint = endpoint;
  }

  // eslint-disable-next-line class-methods-use-this
  private parseResponse<T>(response: AxiosResponse<any, any>): T {
    let responseData: T = response.data;
    if (response.data && typeof response.data !== 'object') {
      try {
        responseData = JSON.parse(response.data);
      } catch (err: any) {
        throw new CheckoutError(
          'Invalid configuration',
          CheckoutErrorType.API_ERROR,
          { error: err },
        );
      }
    }
    return responseData!;
  }

  private async loadConfig(): Promise<RemoteConfiguration | undefined> {
    if (this.configCache) return this.configCache;

    let response: AxiosResponse;
    try {
      response = await this.httpClient.get(
        `${this.endpoint}/${this.version}/config`,
      );
    } catch (err: any) {
      throw new CheckoutError(
        `Error: ${err.message}`,
        CheckoutErrorType.API_ERROR,
        { error: err },
      );
    }

    // Ensure that the configuration is valid
    this.configCache = this.parseResponse<RemoteConfiguration>(response);

    return this.configCache;
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

  public getHttpClient = () => this.httpClient;
}
