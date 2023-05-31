import { Service } from 'typedi';

import { withSDKError } from '../Errors';
import { StudioBE } from '../StudioBE';
import { Store } from '../Store';
import { comparison } from '../utils';

import { RootApiRecipesGetRequest } from '../__codegen__/recipe';

import type {
  DomainRecipe,
  DomainInput,
  DomainCondition,
} from '../__codegen__/recipe';
import type { InventoryItem } from '../__codegen__/inventory';

@Service()
export class Recipe {
  constructor(private studioBE: StudioBE, private store: Store) {}

  @withSDKError({
    type: 'RECIPE_GET_RECIPES_ERROR',
  })
  public async getAll(input: RootApiRecipesGetRequest) {
    const { status, data: recipes } = await this.studioBE.recipeApi.recipesGet(
      input,
    );

    if (!(status >= 200 && status < 300)) {
      // FIXME: align with backend error response types
      throw new Error('status is not successful response', {
        cause: { code: `${status}`, reason: 'unknown' },
      });
    }

    this.store.set((state) => {
      state.recipes = recipes;
    });

    return recipes;
  }

  @withSDKError({
    type: 'RECIPE_GET_RECIPE_BY_ID_ERROR',
  })
  public async getById(id: string) {
    const { data, status } = await this.studioBE.recipeApi.recipesIdGet({ id });

    if (!(status >= 200 && status < 300)) {
      // FIXME: align with backend error response types
      throw new Error('status is not successful response', {
        cause: { code: `${status}`, reason: 'unknown' },
      });
    }

    return data;
  }

  public getInputsBy(
    recipe: DomainRecipe,
    predicateFn: (
      input?: DomainInput,
      index?: number,
      list?: DomainInput[]
    ) => boolean,
  ): Array<[DomainInput, number]> {
    return (recipe.inputs || [])
      .filter(predicateFn)
      .map((input, index) => [input, index] as [DomainInput, number]);
  }

  public getInputsByItem(
    recipe: DomainRecipe,
    item: InventoryItem,
  ): Array<[DomainInput, number]> {
    return this.getInputsBy(recipe, (input) => this.getItemMatchesConditions(item, input?.conditions || []));
  }

  private getItemMatchesConditions(
    item: InventoryItem,
    conditions: Array<DomainCondition>,
  ): boolean {
    return conditions?.every((condition) => {
      const key = `${condition?.ref}`.split('.').pop() as string;
      const metadata: Record<string, any> = {
        item_definition_id: item.item_definition_id,
        ...(item.metadata || {}),
      };

      if (Object.hasOwnProperty.call(metadata, key)) {
        if (condition.type?.includes('sum')) {
          return true;
        }
        return comparison(
          metadata[key],
          condition.expected,
          condition.comparison as any,
        );
      }
      return false;
    });
  }

  public setActive(recipeId: string | undefined) {
    this.store.set((state) => {
      state.selectedRecipeId = recipeId;
    });
  }
}
