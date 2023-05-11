import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { HttpClient } from '../HttpClient';
import { InventoryItem } from '../types';

// TODO: Use generated types
type GetItemsOutput = {
  limit: number;
  page: number;
  sort: string;
  direction: string;
  total_rows: number;
  total_pages: number;
  rows: Array<InventoryItem>;
};

type GetItemsInput = {
  gameId: string;
  userId: string;
};

// TODO: Read from .env
// FIXME: target https://api.dev.games.immutable.com/inventory/swagger/index.html#/root/post_craft
// const defaultBaseURL = 'https://api.sandbox.games.immutable.com/inventory';
const defaultBaseURL = 'http://127.0.0.1:3031/inventory';

export class InventoryService {
  private httpClient: HttpClient;

  constructor(
    httpClientOrBaseUrl: HttpClient | string = defaultBaseURL,
    defaultHeaders: Record<string, string> = {}
  ) {
    if (httpClientOrBaseUrl instanceof HttpClient) {
      this.httpClient = httpClientOrBaseUrl;
    } else {
      this.httpClient = new HttpClient(httpClientOrBaseUrl, defaultHeaders);
    }
  }

  public async getItems(
    input: GetItemsInput
  ): Promise<AxiosResponse<GetItemsOutput>> {
    const url = `/${input.gameId}/items`;
    const config: AxiosRequestConfig = {
      headers: {},
    };
    return this.httpClient.get<GetItemsOutput>(
      `${url}?owner=${input.userId}`,
      config
    );
  }
}

export default InventoryService;
