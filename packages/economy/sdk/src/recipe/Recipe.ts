/* eslint-disable class-methods-use-this */
import { List } from 'linqts';
import { Service } from 'typedi';
import { DomainInput, DomainRecipe, RootApiRecipesGetRequest } from '../__codegen__/recipe';
import { withSDKError } from '../Errors';
import { StudioBE } from '../StudioBE';
import { Store } from '../Store';

@Service()
export class Recipe {
  constructor(private studioBE: StudioBE, private store: Store) { }

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
  public async getById(id: string) {
    const { data, status } = await this.studioBE.recipeApi.recipesIdGet({ id });

    if (!(status >= 200 && status < 300)) {
      // FIXME: align with backend error response types
      throw new Error('status is not successful response', { cause: { code: `${status}`, reason: 'unknown' } });
    }

    return data;
  }

  public getInputsBy(
    recipe: DomainRecipe,
    predicateFn: (input?: DomainInput, index?: number, list?: DomainInput[]) => boolean,
  ) {
    return new List<DomainInput>(recipe.inputs)
      .Where(predicateFn)
      .Select((input, index) => [input, index] as [DomainInput, number])
      .ToArray();
  }

  public setActive(recipeId: string | undefined) {
    this.store.set(() => ({ selectedRecipeId: recipeId }));
  }
}
