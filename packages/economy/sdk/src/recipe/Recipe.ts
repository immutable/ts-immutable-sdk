import { Service } from 'typedi';
import { RootApiRecipesGetRequest, RootApiRecipesIdGetRequest } from '../__codegen__/recipe';
import { withSDKError } from '../Errors';
import { StudioBE } from '../StudioBE';

@Service()
export class Recipe {
  constructor(private studioBE: StudioBE) { }

  @withSDKError({
    type: 'RECIPE_GET_RECIPES_ERROR',
  })
  public async getAll(input: RootApiRecipesGetRequest) {
    const { status, data } = await this.studioBE.recipeApi.recipesGet(input);

    if (!(status >= 200 && status < 300)) {
      // FIXME: align with backend error response types
      throw new Error('status is not successful response', { cause: { code: `${status}`, reason: 'unknown' } });
    }

    return data;
  }

  @withSDKError({
    type: 'RECIPE_GET_RECIPE_BY_ID_ERROR',
  })
  public async getById(id: RootApiRecipesIdGetRequest) {
    const { data, status } = await this.studioBE.recipeApi.recipesIdGet(id);

    if (!(status >= 200 && status < 300)) {
      // FIXME: align with backend error response types
      throw new Error('status is not successful response', { cause: { code: `${status}`, reason: 'unknown' } });
    }

    return data;
  }
}
