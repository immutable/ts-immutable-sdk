/* eslint-disable @typescript-eslint/naming-convention */
import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { Service } from 'typedi';
import { HttpClient } from '../HttpClient';
import { InventoryItem } from '../types';
import { Config } from '../Config';

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

export type GetItemsInput = {
  gameId: string;
  owner: string;
};

@Service()
export class InventoryService {
  constructor(private httpClient: HttpClient, private config: Config) {
    this.httpClient.setBaseURL(`${this.config.servicesBaseURL}/inventory/v1`);
  }

  public async getItems(
    input: GetItemsInput,
  ): Promise<AxiosResponse<GetItemsOutput>> {
    const url = `/${input.gameId}/items`;
    const config: AxiosRequestConfig = {
      headers: {},
    };
    return this.httpClient.get<GetItemsOutput>(
      `${url}?owner=${input.owner}`,
      config,
    );
  }
}

export default InventoryService;
