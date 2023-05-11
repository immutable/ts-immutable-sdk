import { withSDKError } from 'Errors';
import type { EventData, EventType } from '../types';
import { asyncFn } from '../utils';

export type CraftInput = {
  requiresWeb3: boolean;
  web3Assets: Record<string, unknown>;
  // TODO: Update to include recipe payload from spec
  // https://api.dev.games.immutable.com/crafting/swagger/index.html#/
};

// TODO: Use Checkout SDK
const CHECKOUT = {
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
const CRAFT_SERVICE_MOCK = {
  validateCraft: asyncFn('validateCraft'),
  submitCraft: asyncFn('submitCraft'),
};

/**
 * @internal Craft events
 */
export type CraftEvent = EventType<
'CRAFT',
| EventData<'STARTED' | 'IN_PROGRESS'>
| EventData<'COMPLETED', { data: { output: { id: string } } }>
| EventData<'FAILED', { error: { code: string; reason: string } }>
| EventData<
'AWAITING_WEB3_INTERACTION' | 'VALIDATING' | 'SUBMITTED' | 'PENDING'
>
>;

/** List of specific craft statuses */
export type CraftStatus = CraftEvent['status'];

export class Crafting {
  private emitEvent: (event: CraftEvent) => void;

  private service: CraftService;

  constructor(emitEvent: (event: CraftEvent) => void, service?: CraftService) {
    this.service = service || CRAFT_SERVICE_MOCK;
    this.emitEvent = emitEvent;
  }

  /**
   * Given inputs for a recipe crafting
   * process the recipe by sending it to the backend service
   * @param input crafting recipe inputs
   * @returns crafting status
   */
  @withSDKError({ type: 'CRAFTING_ERROR' })
  public async craft(input: CraftInput): Promise<CraftStatus> {
    // 1. validate inputs
    this.emitEvent({ status: 'STARTED', action: 'CRAFT' });
    await this.validate(input);

    // 2. perform any web3 actions
    let txIds: number[] = [];
    let signature;
    if (input.requiresWeb3) {
      this.emitEvent({ status: 'AWAITING_WEB3_INTERACTION', action: 'CRAFT' });
      txIds = await CHECKOUT.transfer(input.web3Assets);
      signature = await CHECKOUT.sign();
    }

    // 3. submit craft to BE
    this.emitEvent({ status: 'SUBMITTED', action: 'CRAFT' });
    await this.service.submitCraft(input, txIds, signature);

    // ? notify the caller of `craft` in real time the status/results

    this.emitEvent({
      status: 'COMPLETED',
      action: 'CRAFT',
      data: {
        output: { id: 'stirng' },
      },
    });

    return 'COMPLETED';
  }

  public async validate(input: CraftInput) {
    return this.service.validateCraft(input);
  }
}
