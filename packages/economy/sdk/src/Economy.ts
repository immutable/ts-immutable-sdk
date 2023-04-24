import { SDK } from './SDK';
import { craft } from './crafting';
import { withSDKError } from './Errors';

import type { CraftInput, CraftStatus, CraftEvent } from './crafting';

/** @internal Economy SDK actions */
export type EconomyEvents = CraftEvent;

export class Economy extends SDK<EconomyEvents> {
  /** Lifecycle method: Self invoked after class instanciation */
  connect(): void {
    this.log('mounted');

    this.subscribe((event) => {
      if (event.action === 'CRAFT' && event.status === 'COMPLETED') {
        event.data;
      }
    });
  }

  /**
   * Given inputs for a recipe crafting
   * process the recipe by sending it to the backend service
   * @param input crafting recipe inputs
   * @returns crafting status
   */
  @withSDKError({ type: 'CRAFTING_ERROR' })
  async craft(input: CraftInput): Promise<CraftStatus> {
    this.emitEvent({ action: 'CRAFT', status: 'STARTED' });

    const status = await craft(input, this.getEmitEventHandler());

    return status;
  }
}
