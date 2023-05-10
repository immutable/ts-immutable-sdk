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
const Checkout = {
  connect: asyncFn('connect'),
  transfer: asyncFn('transfer', [1, 2, 3]),
  sign: asyncFn('sign'),
};

// TODO: Create CraftService class
type CraftService = {
  validateCraft: ReturnType<typeof asyncFn>;
  submitCraft: ReturnType<typeof asyncFn>;
};

// TODO: Replace for CraftService class
const CraftServiceMock = {
  validateCraft: asyncFn('validateCraft'),
  submitCraft: asyncFn('submitCraft'),
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

export class Crafting {
  public x: string = 'test';
  private emitEvent: (event: CraftEvent) => void;
  private service: CraftService;
  private craftingService: CraftingService;

  constructor(emitEvent: (event: CraftEvent) => void, service?: CraftService) {
    this.service = service || CraftServiceMock;
    this.emitEvent = emitEvent;
    // FIXME: make injectable
    this.craftingService = new CraftingService();
  }

  /**
   * Given inputs for a recipe crafting
   * process the recipe by sending it to the backend service
   * @param input crafting recipe inputs
   * @returns crafting status
   */
  @withSDKError({ type: 'CRAFTING_ERROR' })
  public async craft(input: CraftInput): Promise<CraftStatus> {
    console.log('@@@@@@@@@ economy/sdk/src/crafting/Crafting.ts craft', input);
    // return 'FAILED';
    // 1. validate inputs
    this.emitEvent({ status: 'STARTED', action: 'CRAFT' });
    await this.validate(input);

    // 2. perform any web3 actions
    let txIds: number[] = [];
    let signature;
    if (input.requiresWeb3) {
      this.emitEvent({ status: 'AWAITING_WEB3_INTERACTION', action: 'CRAFT' });
      txIds = await Checkout.transfer(input.input);
      signature = await Checkout.sign();
    }

    // 3. submit craft to BE
    this.emitEvent({ status: 'SUBMITTED', action: 'CRAFT' });
    const { data, status } = await this.craftingService.craft(input.input);

    if (status !== 200) {
      this.emitEvent({
        status: 'FAILED',
        action: 'CRAFT',
        error: { code: `${status}`, reason: 'unknown' },
      });
    }

    this.emitEvent({
      status: 'COMPLETED',
      action: 'CRAFT',
      data,
    });

    return 'COMPLETED';
  }

  public async validate(input: CraftInput) {
    return this.service.validateCraft(input);
  }
}
