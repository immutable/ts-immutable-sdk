/* eslint-disable no-console */
import { Service } from 'typedi';

import { RootApiCraftPostRequest as CraftApiInput } from '__codegen__/crafting';
import type { EventData, EventType } from '../types';
import { asyncFn } from '../utils';
import { EventClient } from '../EventClient';
import { withSDKError } from '../Errors';
import { StudioBE } from '../StudioBE';

export type CraftInput = {
  requiresWeb3: boolean;
  web3Assets?: any;
  input: CraftApiInput;
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

/** List of specific craft statuses */
export type CraftStatus = CraftEvent['status'];

@Service()
export class Crafting {
  constructor(
    private events: EventClient<CraftEvent>,
    private studioBE: StudioBE
  ) {}

  /**
   * Given inputs for a recipe crafting
   * process the recipe by sending it to the backend service
   * @param input crafting recipe inputs
   * @returns crafting status
   */
  @withSDKError({ type: 'CRAFTING_ERROR' })
  public async craft(input: CraftInput): Promise<CraftStatus> {
    // 1. validate inputs
    this.events.emitEvent({ status: 'STARTED', action: 'CRAFT' });
    // await this.validate();

    // 2. perform any web3 actions
    let txIds: number[] = [];
    let signature;
    if (input.requiresWeb3) {
      this.events.emitEvent({
        status: 'AWAITING_WEB3_INTERACTION',
        action: 'CRAFT',
      });
      txIds = await checkout.transfer(input.input);
      signature = await checkout.sign();
    }
    console.info('txIds, signature', { txIds, signature });

    // 3. submit craft to BE
    this.events.emitEvent({ status: 'SUBMITTED', action: 'CRAFT' });
    const { data, status } = await this.studioBE.craftingApi.craftPost(
      input.input
    );

    if (status !== 200) {
      this.events.emitEvent({
        status: 'FAILED',
        action: 'CRAFT',
        error: { code: `${status}`, reason: 'unknown' },
      });
    }

    this.events.emitEvent({
      status: 'COMPLETED',
      action: 'CRAFT',
      data,
    });

    return 'COMPLETED';
  }

  /**
   * TODO:
   * Validate a craft input
   * @param input
   * @returns
   */
  // public async validate() {
  //   return true;
  // }
}
