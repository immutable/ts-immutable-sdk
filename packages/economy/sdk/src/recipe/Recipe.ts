import { Service } from 'typedi';
import { withSDKError } from '../Errors';
import { StudioBE } from '../StudioBE';

@Service()
export class Recipe {
  constructor(private studioBE: StudioBE) {}

  @withSDKError({ type: 'RECIPE_ERROR' })
  public async getAll(input: { gameId: string; filters: string[] }) {
    const { data, status } = await this.studioBE.recipeApi.recipesGet({
      gameId: input.gameId,
      filters: input.filters,
    });

    if (status !== 200) {
      throw new Error('GET_RECIPES_ERROR');
    }
    return data;
  }

  @withSDKError({ type: 'RECIPE_ERROR' })
  public async getById(id: string) {
    const { data, status } = await this.studioBE.recipeApi.recipesIdGet({
      id,
    });

    if (status !== 200) {
      throw new Error('GET_RECIPE_BY_ID_ERROR');
    }

    return data;
  }
}
