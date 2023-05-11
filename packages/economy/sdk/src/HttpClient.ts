/* eslint-disable no-console */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export class HttpClient {
  private readonly axiosInstance: AxiosInstance;

  constructor(baseURL: string, defaultHeaders: Record<string, string> = {}) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: defaultHeaders,
    });

    // Setup request
    this.axiosInstance.interceptors.request.use((config) => {
      console.info({
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
        headers: config.headers,
      });
      return config;
    });

    // Add response interceptor to log response details
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.info({
          status: response.status,
          statusText: response.statusText,
          data: response.data,
        });
        return response;
      },
      (error) => {
        console.error({
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });
        return Promise.reject(error);
      },
    );
  }

  public async get<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  public async delete<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }

  public setBaseURL(baseURL: string) {
    this.axiosInstance.defaults.baseURL = baseURL;
  }
}

export default HttpClient;
