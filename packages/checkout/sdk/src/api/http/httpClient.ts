import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { CheckoutModuleConfiguration } from '../../types';

const PUBLISHABLE_KEY_PREFIX = 'pk_imapik-';

const publishableKeyDomainAllowlist = [
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
    return publishableKeyDomainAllowlist.some((domain) => url.startsWith(domain));
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

  public async request(config: AxiosRequestConfig) {
    return await this.axiosInstance.request(config);
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
