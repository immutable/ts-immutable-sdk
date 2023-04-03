import { CraftInput, ICraftStatus, craft } from './crafting';

export class Economy {
  /**
   * Given inputs for a recipe crafting
   * process the recipe by sending it to the backend service
   * @param input crafting recipe inputs
   * @returns crafting status
   */
  async craft(input: CraftInput): Promise<ICraftStatus> {
    return craft(input);
  }
}
