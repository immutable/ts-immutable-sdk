import { Service } from 'typedi';
import { AxiosResponse } from 'axios';
import querystring from 'querystring';

import { Recipe } from '../types';
import { HttpClient } from '../HttpClient';
import { Config } from '../Config';

@Service()
export class RecipeService {
  constructor(private httpClient: HttpClient, private config: Config) {
    this.httpClient.setBaseURL(`${this.config.servicesBaseURL}/recipe`);
  }

  public async getRecipes(
    gameId: string,
    filters?: string[],
  ): Promise<AxiosResponse<Array<Recipe>>> {
    const query = querystring.stringify({ filters });
    const url = `/recipes?game_id=${gameId}${query ? `&${query}` : ''}`;
    return this.httpClient.get(url);
  }

  public async getRecipeById(id: string): Promise<AxiosResponse<Recipe>> {
    const url = `/recipe/${id}`;
    return this.httpClient.get(url);
  }
}

export default RecipeService;
