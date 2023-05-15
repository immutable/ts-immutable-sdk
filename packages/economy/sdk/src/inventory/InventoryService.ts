/* eslint-disable @typescript-eslint/naming-convention */
import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { Service } from 'typedi';
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
// const defaultBaseURL = 'https://api.sandbox.games.immutable.com/inventory/v1';
const defaultBaseURL = 'http://127.0.0.1:3031/inventory';

@Service()
export class InventoryService {
  constructor(private httpClient: HttpClient) {
    this.httpClient.setBaseURL(defaultBaseURL);
  }

  public async getItems(
    input: GetItemsInput,
  ): Promise<AxiosResponse<GetItemsOutput>> {
    const url = `/${input.gameId}/items`;
    const config: AxiosRequestConfig = {
      headers: {},
    };
    return this.httpClient.get<GetItemsOutput>(
      `${url}?owner=${input.userId}`,
      config,
    );
  }
}

export default InventoryService;
