/* eslint-disable no-console */
import Container, { Service } from 'typedi';
import type { EventData, EventType } from '../types';
import { asyncFn } from '../utils';
import { withSDKError } from '../Errors';

import { CraftingService } from './CraftingService';

// FIXME: Use generated types
// FIXME: Update to include recipe payload from spec
// https://api.dev.games.immutable.com/crafting/swagger/index.html#/
export type CraftInput = {
  requiresWeb3: boolean;
  web3Assets?: any;
  input: {
    userId: string;
    gameId: string;
    recipeId: string;
    ingredients: Array<{
      conditionId: string;
      itemId: string;
    }>;
  };
};

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

type EmitEventFn = (event: CraftEvent) => void;

/** List of specific craft statuses */
export type CraftStatus = CraftEvent['status'];

@Service()
export class Crafting {
  constructor(private craftingService: CraftingService) {}

  /**
   * Given inputs for a recipe crafting
   * process the recipe by sending it to the backend service
   * @param input crafting recipe inputs
   * @returns crafting status
   */
  @withSDKError({ type: 'CRAFTING_ERROR' })
  public async craft(input: CraftInput): Promise<CraftStatus> {
    const emitEvent = Container.get<EmitEventFn>('EmitEventHandler');

    // 1. validate inputs
    emitEvent({ status: 'STARTED', action: 'CRAFT' });
    await this.validate();

    // 2. perform any web3 actions
    let txIds: number[] = [];
    let signature;
    if (input.requiresWeb3) {
      emitEvent({ status: 'AWAITING_WEB3_INTERACTION', action: 'CRAFT' });
      txIds = await checkout.transfer(input.input);
      signature = await checkout.sign();
    }
    console.info('txIds, signature', { txIds, signature });

    // 3. submit craft to BE
    emitEvent({ status: 'SUBMITTED', action: 'CRAFT' });
    const { data, status } = await this.craftingService.craft(input.input);

    if (status !== 200) {
      emitEvent({
        status: 'FAILED',
        action: 'CRAFT',
        error: { code: `${status}`, reason: 'unknown' },
      });
    }

    emitEvent({
      status: 'COMPLETED',
      action: 'CRAFT',
      data,
    });

    return 'COMPLETED';
  }

  /**
   * Validate a craft input
   * @param input
   * @returns
   */
  public async validate() {
    // TODO
    return this.craftingService.validate();
  }
}
