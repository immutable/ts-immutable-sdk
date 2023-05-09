import { AxiosResponse, AxiosRequestConfig } from 'axios';
import HttpClient from '../HttpClient';

// TODO: Use generated types
type GetItemsOutput = {};

type GetItemsInput = {
  userId: string;
};

// TODO: Read from .env
// FIXME: target https://api.dev.games.immutable.com/inventory/swagger/index.html#/root/post_craft
// const defaultBaseURL = 'http://127.0.0.1:3031/inventory';
const defaultBaseURL =
  'https://api.sandbox.games.immutable.com/inventory/v1/sb/items';

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
    const url = ``;
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
