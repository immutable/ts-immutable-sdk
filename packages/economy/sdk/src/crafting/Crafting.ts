/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
import { Service } from 'typedi';

import {
  CraftCreateCraftInput,
  CraftCreateCraftOutput,
  DomainCraft,
} from '../__codegen__/crafting';
import type { EventData, EventType } from '../types';
import { asyncFn } from '../utils';
import { EventClient } from '../EventClient';
import { withSDKError } from '../Errors';
import { StudioBE } from '../StudioBE';
import { Config } from '../Config';

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
  ) {}

  /**
   * Given inputs for a recipe crafting
   * process the recipe by sending it to the backend service
   * @param input crafting recipe inputs
   * @returns crafting status
   */
  @withSDKError({ type: 'CRAFTING_ERROR' })
  public async craft(
    input: CraftCreateCraftInput,
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
    userId: string,
  ): Promise<Array<DomainCraft>> {
    try {
      const { status, data } = await this.studioBE.craftingApi.craftsGet();

      if (!(status >= 200 && status < 300)) {
        throw new Error('error fetching crafts');
      }

      // TODO: Sort by latest
      return data.filter(
        (craft) => craft.game_id === gameId && craft.user_id === userId,
      );
    } catch (error) {
      throw new Error('error fetching crafts', { cause: { error } });
    }
  }
}
