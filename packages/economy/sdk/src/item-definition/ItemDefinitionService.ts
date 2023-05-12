import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { HttpClient } from '../HttpClient';
import { ItemDefinition } from '../types';

// TODO: Read from .env
// FIXME: target https://api.dev.games.immutable.com/inventory/swagger/index.html#/root/post_craft
const defaultBaseURL = 'http://127.0.0.1:3031/item-definition';
// const defaultBaseURL =
//   'https://api.sandbox.games.immutable.com/item-definition/v1';

export class ItemDefinitionService {
  private httpClient: HttpClient;

  constructor(
    httpClientOrBaseUrl: HttpClient | string = defaultBaseURL,
    defaultHeaders: Record<string, string> = {},
  ) {
    if (httpClientOrBaseUrl instanceof HttpClient) {
      this.httpClient = httpClientOrBaseUrl;
    } else {
      this.httpClient = new HttpClient(httpClientOrBaseUrl, defaultHeaders);
    }
  }

  public async getById(id: string): Promise<AxiosResponse<ItemDefinition>> {
    const url = `/definitions/${id}`;
    const config: AxiosRequestConfig = {
      headers: {},
    };
    return this.httpClient.get(url, config);
  }
}

export default ItemDefinitionService;
