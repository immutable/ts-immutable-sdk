/* eslint-disable @typescript-eslint/naming-convention */
import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { Service } from 'typedi';
import { HttpClient } from '../HttpClient';
import { Config } from '../Config';
import { InventoryPaginatedItems } from '../__codegen__/inventory';

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
  ): Promise<AxiosResponse<InventoryPaginatedItems>> {
    const url = `/${input.gameId}/items`;
    const config: AxiosRequestConfig = {
      headers: {},
    };
    return this.httpClient.get<InventoryPaginatedItems>(
      `${url}?owner=${input.owner}`,
      config,
    );
  }
}

export default InventoryService;
