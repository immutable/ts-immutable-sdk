import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { CheckoutModuleConfiguration } from '../../types';
import { CheckoutError, CheckoutErrorType } from '../../errors';

const PUBLISHABLE_KEY_PREFIX = 'pk_imapik-';

const publishableKeyWhitelistedDomain = [
  'https://checkout-api.dev.immutable.com',
  'https://checkout-api.sandbox.immutable.com',
  'https://checkout-api.immutable.com',
];

export class HttpClient {
  protected config: any;

  protected axiosInstance: AxiosInstance;

  constructor(config?: CheckoutModuleConfiguration) {
    this.config = config;

    this.axiosInstance = axios.create();
    this.setupInterceptors();
  }

  // eslint-disable-next-line class-methods-use-this
  private shouldAddPublishableKey(url: string): boolean {
    // Check if the request is going to a whitelisted domain
    return publishableKeyWhitelistedDomain.some((domain) => url.startsWith(domain));
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const publishableKey = this.config?.baseConfig?.publishableKey;
        if (publishableKey && this.shouldAddPublishableKey(config.url || '')) {
          if (!publishableKey.startsWith(PUBLISHABLE_KEY_PREFIX)) {
            throw new Error(
              'Invalid Publishable key. Create your Publishable key in Immutable developer hub.'
              + ' https://hub.immutable.com',
            );
          }

          // Add publishable key header for whitelisted domains
          // eslint-disable-next-line no-param-reassign
          config.headers['x-immutable-publishable-key'] = publishableKey;
        }

        return config;
      },
      (error) => Promise.reject(error),
    );
  }

  // eslint-disable-next-line class-methods-use-this
  private processResponse(response: AxiosResponse) {
    console.log('Process Response..', response);
    if (response?.status !== 200) {
      throw new CheckoutError(
        `Error fetching from api: ${response.status} ${response.statusText}`,
        CheckoutErrorType.API_ERROR,
      );
    }
  }

  public async request(config: AxiosRequestConfig) {
    let response;
    try {
      response = await this.axiosInstance.request(config);
    } catch (error: any) {
      throw new CheckoutError(`Error fetching from api: ${error.message}`, CheckoutErrorType.API_ERROR);
    }

    this.processResponse(response);
    return response;
  }

  public async get(url: string, config?: AxiosRequestConfig) {
    const requestConfig: AxiosRequestConfig = {
      ...config,
      url,
    };
    return await this.request(requestConfig);
  }

  public async post(url: string, data?: any, config?: AxiosRequestConfig) {
    const requestConfig: AxiosRequestConfig = {
      ...config,
      data,
      url,
    };
    return await this.request(requestConfig);
  }

  public async put(url: string, data?: any, config?: AxiosRequestConfig) {
    const requestConfig: AxiosRequestConfig = {
      ...config,
      data,
      url,
    };
    return await this.request(requestConfig);
  }

  public async delete(url: string, data?: any, config?: AxiosRequestConfig) {
    const requestConfig: AxiosRequestConfig = {
      ...config,
      data,
      url,
    };
    return await this.request(requestConfig);
  }
}
