/* eslint-disable  */
import { Service } from 'typedi';

import {
  CraftIngredient,
  CraftCreateCraftInput,
  CraftCreateCraftOutput,
  DomainCraft,
} from '../__codegen__/crafting';
import type { EventData, EventType, InventoryItem } from '../types';
import { asyncFn, comparison } from '../utils';
import { EventClient } from '../EventClient';
import { withSDKError } from '../Errors';
import { StudioBE } from '../StudioBE';
import { Config } from '../Config';
import { Store } from '../Store';
import { Recipe } from '../recipe/Recipe';

// TODO: Use Checkout SDK
const checkout = {
  connect: asyncFn('connect'),
  transfer: asyncFn('transfer', [1, 2, 3]),
  sign: asyncFn('sign'),
};

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
    private recipe: Recipe
  ) {}

  /**
   * Given inputs for a recipe crafting
   * process the recipe by sending it to the backend service
   * @param input crafting recipe inputs
   * @returns crafting status
   */
  @withSDKError({ type: 'CRAFTING_ERROR' })
  public async craft(
    input: CraftCreateCraftInput
  ): Promise<CraftCreateCraftOutput> {
    // 1. validate inputs
    this.events.emitEvent({ status: 'STARTED', action: 'CRAFT' });
    await this.validate();

    // 2. submit craft to BE
    this.events.emitEvent({ status: 'SUBMITTED', action: 'CRAFT' });
    const { data, status } = await this.studioBE.craftingApi.craftPost({
      request: input,
    });

    if (status !== 200) {
      this.events.emitEvent({
        status: 'FAILED',
        action: 'CRAFT',
        error: { code: `${status}`, reason: 'unknown' },
      });
    }

    // 3. transfer assets to escrow wallet if needed
    // TODO: true if inputs contain tokens
    const requiresWeb3 = false;
    if (requiresWeb3) {
      await this.transferAssetsToEscrowWallet(data);
    }

    this.events.emitEvent({
      status: 'COMPLETED',
      action: 'CRAFT',
      data,
    });

    return data;
  }

  private async transferAssetsToEscrowWallet(output: CraftCreateCraftOutput) {
    const provider = this.config.get().imxProvider;
    if (!provider) {
      throw new Error('No provider found');
    }

    this.events.emitEvent({
      status: 'AWAITING_WEB3_INTERACTION',
      action: 'CRAFT',
    });

    checkout.transfer();

    // TODO: user provider to sign transfer to escrow wallet address

    return output;
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

  @withSDKError({ type: 'CRAFTING_ERROR' })
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
            (cond) => cond.type === 'sum' || cond.type === 'qty'
          );

          const key = condition?.ref;
          const expected = condition?.expected;
          const op = condition?.comparison as string;
          let curr = 0;

          if (condition?.type === 'sum') {
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

          if (condition?.type === 'qty') {
            curr = this.store
              .get()
              .craftingInputs.filter(
                ({ condition_id }) => condition_id === input.id
              ).length;

            return !comparison(curr, expected, op);
          }

          return false;
        }

        return true;
      }) || [];

    if (!availableInput?.id) {
      throw new Error('No available input found');
    }

    this.addInput({
      condition_id: availableInput.id,
      item_id: item.id,
    });
  }

  /**
   * TODO:
   * Validate a craft input
   * @param input
   * @returns
   */
  @withSDKError({ type: 'CRAFTING_ERROR' })
  public async validate() {
    // TODO: submit craft to BE for validation
    return true;
  }

  @withSDKError({ type: 'CRAFTING_ERROR' })
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
