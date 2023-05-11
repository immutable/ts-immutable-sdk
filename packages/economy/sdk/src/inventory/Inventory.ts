import type { EventData, EventType } from '../types';
import { asyncFn } from '../utils';
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
  private emitEvent: (event: InventoryEvent) => void;
  private inventoryService: InventoryService;

  constructor(emitEvent: (event: InventoryEvent) => void) {
    this.emitEvent = emitEvent;
    // FIXME: make injectable
    this.inventoryService = new InventoryService();
  }

  @withSDKError({ type: 'GET_INVENTORY_ERROR' })
  public async getItems(input: GetInventoryInput) {
    const { data, status } = await this.inventoryService.getItems(input);

    if (status !== 200) {
      throw new Error('GET_INVENTORY_ERROR');
    }

    return data.rows;
  }
}
