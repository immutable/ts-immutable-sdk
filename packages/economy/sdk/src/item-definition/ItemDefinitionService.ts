import { AxiosResponse, AxiosRequestConfig } from 'axios';
import HttpClient from '../HttpClient';

// TODO: Use generated types
type GetItemsOutput = {};

type GetItemDefinitionInput = {
  id: string;
};

// TODO: Read from .env
// FIXME: target https://api.dev.games.immutable.com/inventory/swagger/index.html#/root/post_craft
const defaultBaseURL = 'http://127.0.0.1:3031/item-definition/v1/definitions/';
// const defaultBaseURL =
//   'https://api.sandbox.games.immutable.com/item-definition/v1/definitions/';

export class ItemDefinitionService {
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

  public async getItemDefinition(
    input: GetItemDefinitionInput
  ): Promise<AxiosResponse<GetItemsOutput>> {
    const url = ``;
    const config: AxiosRequestConfig = {
      headers: {},
    };
    return this.httpClient.get<GetItemsOutput>(`${url}/${input.id}`, config);
  }
}

export default ItemDefinitionService;
