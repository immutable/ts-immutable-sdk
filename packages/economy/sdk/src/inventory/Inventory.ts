import type { EventType } from '../types';
import { withSDKError } from '../Errors';

import { InventoryService } from './InventoryService';

type GetInventoryInput = { userId: string; gameId: string };

/**
 * @internal Assets events
 */
export type InventoryEvent = EventType<'INVENTORY'>;

/** List of specific Assets statuses */
export type InventoryStatus = InventoryEvent['status'];

export class Inventory {
  private inventoryService: InventoryService;

  // FIXME: make injectable
  constructor() {
    this.inventoryService = new InventoryService();
  }

  @withSDKError({ type: 'INVENTORY_ERROR' })
  public async getItems(input: GetInventoryInput) {
    const { data, status } = await this.inventoryService.getItems(input);

    if (status !== 200) {
      throw new Error('GET_INVENTORY_ERROR');
    }

    return data.rows;
  }
}
