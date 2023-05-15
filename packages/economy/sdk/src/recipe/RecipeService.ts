import { AxiosResponse } from 'axios';
import querystring from 'querystring';

import { Service } from 'typedi';
import { HttpClient } from '../HttpClient';
import { Recipe } from '../types';

// TODO: Read from .env
// FIXME: target https://api.dev.games.immutable.com/inventory/swagger/index.html#/root/post_craft
const defaultBaseURL = 'http://127.0.0.1:3031/recipe';
// const defaultBaseURL =
//   'https://api.sandbox.games.immutable.com/recipe'

@Service()
export class RecipeService {
  constructor(private httpClient: HttpClient) {
    this.httpClient.setBaseURL(defaultBaseURL);
  }

  public async getRecipes(
    gameId: string,
    filters?: string[]
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
