/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable class-methods-use-this */

import { Service } from 'typedi';
import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { HttpClient } from '../HttpClient';

// TODO: Use generated types
type CraftOutput = {};

type CraftInput = {
  ingredients: CraftIngredient[];
  recipeId: string;
  userId: string;
  gameId: string;
};

type CraftIngredient = {
  conditionId: string;
  itemId: string;
};

// TODO: Read from .env or inject config
// FIXME: target https://api.dev.games.immutable.com/crafting/swagger/index.html#/root/post_craft
// const defaultBaseURL = 'https://api.sandbox.games.immutable.com/crafting/v1';
const defaultBaseURL = 'http://127.0.0.1:3031/crafting';

@Service()
export class CraftingService {
  constructor(private httpClient: HttpClient) {
    this.httpClient.setBaseURL(defaultBaseURL);
  }

  public async craft(input: CraftInput): Promise<AxiosResponse<CraftOutput>> {
    const url = '/craft';
    const data = {
      recipe_id: input.recipeId,
      user_id: input.userId,
      game_id: input.gameId,
      ingredients: input.ingredients.map((i) => ({
        condition_id: i.conditionId,
        item_id: i.itemId,
      })),
    };
    const config: AxiosRequestConfig = {
      headers: {},
    };
    return this.httpClient.post<CraftOutput>(url, data, config);
  }

  public async validate(): Promise<Boolean> {
    // TODO: Validate from API
    return true;
  }
}

export default CraftingService;
