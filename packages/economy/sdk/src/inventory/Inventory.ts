import type { EventData, EventType } from '../types';
import { asyncFn } from '../utils';
import { withSDKError } from '../Errors';

import { InventoryService } from './InventoryService';

// FIXME: Use generated types
// FIXME: Update to include recipe payload from spec
// https://api.dev.games.immutable.com/Assetsing/swagger/index.html#/
export type AssetsInput = {
  requiresWeb3: boolean;
  web3Assets?: any;
  input: {
    userId: string;
    recipeId: string;
    ingredients: Array<{
      conditionId: string;
      itemId: string;
    }>;
  };
};

// TODO: Create InventoryService class
// type InventoryService = {
//   validateAssets: ReturnType<typeof asyncFn>;
//   submitAssets: ReturnType<typeof asyncFn>;
// };

// TODO: Replace for InventoryService class
const InventoryServiceMock = {
  getItems: asyncFn('getItems'),
  // submitAssets: asyncFn('submitAssets'),
};

/**
 * @internal Assets events
 */
export type InventoryEvent = EventType<
  'INVENTORY',
  | EventData<'STARTED' | 'IN_PROGRESS'>
  | EventData<'COMPLETED', { data: {} }>
  | EventData<'FAILED', { error: { code: string; reason: string } }>
>;

/** List of specific Assets statuses */
export type InventoryStatus = InventoryEvent['status'];

export class Inventory {
  public x: string = 'test';
  private emitEvent: (event: InventoryEvent) => void;
  // private service: InventoryService;
  private inventoryService: InventoryService;

  constructor(
    emitEvent: (event: InventoryEvent) => void,
    service?: InventoryService
  ) {
    this.emitEvent = emitEvent;
    // FIXME: make injectable
    this.inventoryService = new InventoryService();
  }

  /**
   * Given inputs for a recipe Assetsing
   * process the recipe by sending it to the backend service
   * @param input Assetsing recipe inputs
   * @returns Assetsing status
   */
  @withSDKError({ type: 'GET_ITEMS_ERROR' })
  public async getItems(userId: string): Promise<InventoryStatus> {
    console.log(
      '@@@@@@@@@ economy/sdk/src/inventory/Inventory.ts getItems',
      userId
    );
    // 1. fetch assets from BE
    // this.emitEvent({ status: 'SUBMITTED', action: 'Assets' });
    const { data, status } = await this.inventoryService.getItems({ userId });

    if (status !== 200) {
      this.emitEvent({
        status: 'FAILED',
        action: 'INVENTORY',
        error: { code: `${status}`, reason: 'unknown' },
      });
    }

    this.emitEvent({
      status: 'COMPLETED',
      action: 'INVENTORY',
      data,
    });

    return 'COMPLETED';
  }
}
