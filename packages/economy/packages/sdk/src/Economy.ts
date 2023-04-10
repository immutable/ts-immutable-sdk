import { SDK } from './SDK';
import { craft } from './crafting';
import { withSDKError } from './Errors';

import type { CraftInput, CraftStatuses } from './crafting';

export type EconomyEventType = 'CRAFT' | 'PURCHASE';

export class Economy extends SDK<EconomyEventType> {
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
  async craft(input: CraftInput): Promise<CraftStatuses> {
    this.emitEvent('CRAFT', 'INITIAL');

    const status = await craft(input, this.getEmitEventHandler('CRAFT'));

    return status;
  }
}
