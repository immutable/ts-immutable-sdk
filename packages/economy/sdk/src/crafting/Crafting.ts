/* eslint-disable  */
import { Service } from 'typedi';

import type { EventData, EventType } from '../types';
import { comparison } from '../utils';
import { EventClient } from '../EventClient';
import { StudioBE } from '../StudioBE';
import { Config } from '../Config';
import { Store } from '../Store';
import { Recipe } from '../recipe/Recipe';
import { Provider } from '../provider/Provider';

import { InventoryItem } from '../__codegen__/inventory';
import {
  CraftIngredient,
  CraftCreateCraftInput,
  CraftCreateCraftOutput,
  DomainCraft,
} from '../__codegen__/crafting';

/**
 * @internal Craft events
 */
export type CraftEvent = EventType<
  'CRAFT',
  | EventData<'STARTED' | 'IN_PROGRESS'>
  | EventData<'COMPLETED', { data: {} }>
  | EventData<'FAILED', { error: { code: string; reason: string } }>
  | EventData<
      'AWAITING_WEB3_INTERACTION' | 'VALIDATING' | 'SUBMITTED' | 'PENDING'
    >
>;

/** List of specific craft statuses */
export type CraftStatus = CraftEvent['status'];

@Service()
export class Crafting {
  constructor(
    private events: EventClient<CraftEvent>,
    private studioBE: StudioBE,
    private config: Config,
    private store: Store,
    private recipe: Recipe,
    private provider: Provider
  ) {}

  /**
   * Given inputs for a recipe crafting
   * process the recipe by sending it to the backend service
   * @param input crafting recipe inputs
   * @returns crafting status
   */
  public async craft(
    input: CraftCreateCraftInput
  ): Promise<CraftCreateCraftOutput> {
    // 1. validate inputs
    await this.validate();

    // 2. submit craft to BE
    const { data: output, status } = await this.studioBE.craftingApi.craftPost({
      request: input,
    });

    if (!(status >= 200 && status < 300)) {
      throw new Error('Crafting failed');
    }

    // 3. transfer assets to escrow wallet if needed
    await this.transferAssetsToEscrowWallet(input, output);

    return output;
  }

  private async transferAssetsToEscrowWallet(
    input: CraftCreateCraftInput,
    output: CraftCreateCraftOutput
  ) {
    const tokenIds = input.ingredients
      .map(
        ({ item_id }) =>
          this.store.get().inventory.find((item) => item.id === item_id)
            ?.token_id
      )
      .filter(Boolean)
      .map(Number);

    // no ntfs found then skip transfer
    if (tokenIds.length === 0 || !output.id) {
      return;
    }

    this.provider.transfer(output.id, tokenIds);
  }

  public addInput(input: CraftIngredient) {
    this.store.set((state) => {
      state.craftingInputs.push(input);
    });
  }

  public removeInput(itemId: string) {
    this.store.set((state) => {
      state.craftingInputs = state.craftingInputs.filter(
        (input) => input.item_id !== itemId
      );
    });
  }

  public resetCraftingInputs() {
    this.store.set((state) => {
      state.selectedRecipeId = undefined;
      state.craftingInputs = [];
    });
  }

  public addInputByItem(item: InventoryItem) {
    const { selectedRecipeId } = this.store.get();

    if (!selectedRecipeId) {
      throw new Error('No recipe selected');
    }

    const recipe = this.store
      .get()
      .recipes.find((r) => r.id === selectedRecipeId);

    if (!recipe) {
      throw new Error('Selected recipe not found');
    }

    const allInputs = this.recipe.getInputsByItem(recipe, item);

    const [availableInput] =
      allInputs.find(([input]) => {
        if (input.type === 'multiple_item') {
          const condition = input.conditions?.find(
            (cond) => cond.type?.includes('sum') || cond.type === 'qty'
          );

          const key = `${condition?.ref}`.split('.').pop()
          const expected = condition?.expected;
          const op = condition?.comparison as string;
          let curr = 0;

          if (condition?.type?.includes('sum')) {
            curr = this.store
              .get()
              .craftingInputs.filter(
                ({ condition_id }) => condition_id === input.id
              )
              .map(({ item_id }) =>
                this.store.get().inventory.find((item) => item.id === item_id)
              )
              .reduce((acc, item) => {
                return (
                  acc + Number({ ...item?.metadata }?.[key as string]) || 0
                );
              }, 0);

            return !comparison(curr, expected, op);
          }

          if (condition?.type?.includes('qty')) {
            curr = this.store
              .get()
              .craftingInputs.filter(
                ({ condition_id }) => condition_id === input.id
              ).length;

            return !comparison(curr, expected, op);
          }

          return false;
        }

        return (
          this.store
            .get()
            .craftingInputs.findIndex(
              (usedInput) => usedInput.condition_id === input.id
            ) === -1
        );
      }) || [];

    if (!availableInput?.id) {
      throw new Error('No available input found');
    }

    this.addInput({
      condition_id: availableInput.id,
      item_id: item.id as string,
    });
  }

  /**
   * TODO:
   * Validate a craft input
   * @param input
   * @returns
   */
  public async validate() {
    // TODO: submit craft to BE for validation
    return true;
  }

  public async getTransactions(
    gameId: string,
    userId: string
  ): Promise<Array<DomainCraft>> {
    try {
      const { status, data } = await this.studioBE.craftingApi.craftsGet();

      if (!(status >= 200 && status < 300)) {
        throw new Error('error fetching crafts');
      }

      // TODO: Sort by latest
      return data.filter(
        (craft) => craft.game_id === gameId && craft.user_id === userId
      );
    } catch (error) {
      throw new Error('error fetching crafts', { cause: { error } });
    }
  }
}
