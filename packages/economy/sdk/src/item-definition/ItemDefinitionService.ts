import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { Service } from 'typedi';
import { HttpClient } from '../HttpClient';
import { ItemDefinition } from '../types';
import { Config } from '../Config';

@Service()
export class ItemDefinitionService {
  constructor(private httpClient: HttpClient, private config: Config) {
    this.httpClient.setBaseURL(`${this.config.servicesBaseURL}/item-definition`);
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
