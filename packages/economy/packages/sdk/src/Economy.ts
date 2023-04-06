import { CraftInput, ICraftStatus, craft } from './crafting';
import { withSDKError } from './Errors';
import { SDK } from './SDK';

export class Economy extends SDK {
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
  async craft(input: CraftInput): Promise<ICraftStatus> {
    const status = await craft(input);

    return status;
  }
}
