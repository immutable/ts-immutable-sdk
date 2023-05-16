import { Service } from 'typedi';
import { withSDKError } from '../Errors';

import { RecipeService } from './RecipeService';

@Service()
export class Recipe {
  constructor(private recipeService: RecipeService) {
  }

  @withSDKError({ type: 'RECIPE_ERROR' })
  public async getRecipes(input: { gameId: string; filters: string[] }) {
    const { data, status } = await this.recipeService.getRecipes(
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
    const { data, status } = await this.recipeService.getRecipeById(id);

    if (status !== 200) {
      throw new Error('GET_RECIPE_BY_ID_ERROR');
    }

    return data;
  }
}
