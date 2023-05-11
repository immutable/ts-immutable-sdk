import { withSDKError } from '../Errors';

import { RecipeService } from './RecipeService';

export class Recipe {
  private service: RecipeService;

  // FIXME: make injectable
  constructor() {
    this.service = new RecipeService();
  }

  @withSDKError({ type: 'RECIPE_ERROR' })
  public async getRecipes(input: { gameId: string; filters: string[] }) {
    const { data, status } = await this.service.getRecipes(
      input.gameId,
      input.filters,
    );

    if (status !== 200) {
      throw new Error('GET_RECIPES_ERROR');
    }
    return data;
  }

  @withSDKError({ type: 'RECIPE_ERROR' })
  public async getRecipeById(id: string) {
    const { data, status } = await this.service.getRecipeById(id);

    if (status !== 200) {
      throw new Error('GET_RECIPE_BY_ID_ERROR');
    }

    return data;
  }
}
