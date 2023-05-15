import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { Service } from 'typedi';
import { HttpClient } from '../HttpClient';
import { ItemDefinition } from '../types';

// TODO: Read from .env
// FIXME: target https://api.dev.games.immutable.com/inventory/swagger/index.html#/root/post_craft
const defaultBaseURL = 'http://127.0.0.1:3031/item-definition';
// const defaultBaseURL =
//   'https://api.sandbox.games.immutable.com/item-definition/v1';

@Service()
export class ItemDefinitionService {
  constructor(private httpClient: HttpClient) {
    this.httpClient.setBaseURL(defaultBaseURL);
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
