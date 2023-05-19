// /* eslint-disable @typescript-eslint/naming-convention */
import { AxiosResponse } from 'axios';
// import { Service } from 'typedi';
// import { HttpClient } from '../HttpClient';
import {
  RootApi,
  InventoryPaginatedItems,
  RootApiGameIDItemsGetRequest,
  Configuration,
} from '__codegen__/inventory';
import { Config } from '../Config';
// import { InventoryPaginatedItems } from '../__codegen__/inventory';

// export type GetItemsInput = {
//   gameId: string;
//   owner: string;
// };

// @Service()
// export class InventoryService {
//   constructor(private httpClient: HttpClient, private config: Config) {
//     this.httpClient.setBaseURL(`${this.config.servicesBaseURL}/inventory/v1`);
//   }

//   public async getItems(
//     input: GetItemsInput,
//   ): Promise<AxiosResponse<InventoryPaginatedItems>> {
//     const url = `/${input.gameId}/items`;
//     const config: AxiosRequestConfig = {
//       headers: {},
//     };
//     return this.httpClient.get<InventoryPaginatedItems>(
//       `${url}?owner=${input.owner}`,
//       config,
//     );
//   }
// }

// export default InventoryService;

export class InventoryApiService {
  public httpClient: RootApi;

  public apiConfig: Configuration;

  constructor(private config: Config) {
    this.apiConfig = new Configuration({
      basePath: `${this.config.servicesBaseURL}/inventory/v1`,
    });

    this.httpClient = new RootApi(this.apiConfig);
  }

  public async getItems(
    input: RootApiGameIDItemsGetRequest
  ): Promise<AxiosResponse<InventoryPaginatedItems>> {
    console.log('@inside inventory API Service');
    return this.httpClient.gameIDItemsGet(input);
  }
}

export default InventoryApiService;
