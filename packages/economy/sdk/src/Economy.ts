import { SDK } from './SDK';
import { craft } from './crafting';
import { withSDKError } from './Errors';

import type { CraftInput, CraftStatus } from './crafting';

/**
 * Type of actions found in the Economy SDK
 */
export enum EconomyActionTypes {
  'CRAFT' = 'CRAFT',
  'PURCHASE' = 'PURCHASE',
}
export type EconomyActionType = keyof typeof EconomyActionTypes;

export class Economy extends SDK<EconomyActionType> {
  /** Lifecycle method: Self invoked after class instanciation */
  connect(): void {
    this.log('mounted');
  }

  /**
   * Given inputs for a recipe crafting
   * process the recipe by sending it to the backend service
   * @param input crafting recipe inputs
   * @returns crafting status
   */
  @withSDKError({ type: 'CRAFTING_ERROR' })
  async craft(input: CraftInput): Promise<CraftStatus> {
    this.emitEvent('CRAFT', 'INITIAL');

    const status = await craft(input, this.getEmitEventHandler('CRAFT'));

    return status;
  }
}
