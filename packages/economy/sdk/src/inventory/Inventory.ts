import { Service } from 'typedi';
import type { EventData, EventType } from '../types';
import { withSDKError } from '../Errors';

import { GetItemsInput, InventoryService } from './InventoryService';
import { EventClient } from '../EventClient';

/**
 * @internal Assets events
 */
export type InventoryEvent = EventType<
'INVENTORY_GET_ITEMS',
| EventData<'STARTED' | 'IN_PROGRESS'>
| EventData<'COMPLETED', { data: {} }>
| EventData<'FAILED', { error: { code: string; reason: string } }>
>
| EventType<'INVENTORY_FILTER_ITEMS_BY'>;

/** List of specific Assets statuses */
export type InventoryStatus = InventoryEvent['status'];

@Service()
export class Inventory {
  constructor(private inventoryService: InventoryService, private events: EventClient<InventoryEvent>) {
  }

  @withSDKError({ type: 'INVENTORY_GET_ITEMS_ERROR' })
  public async getItems(input: GetItemsInput) {
    this.events.emitEvent({ status: 'STARTED', action: 'INVENTORY_GET_ITEMS' });

    const { data, status } = await this.inventoryService.getItems(input);

    if (status !== 200) {
      throw new Error('GET_INVENTORY_ERROR');
    }

    return data.rows;
  }
}
