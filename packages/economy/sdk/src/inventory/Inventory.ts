import { Service } from 'typedi';
import { withSDKError } from '../Errors';

import { GetItemsInput, InventoryService } from './InventoryService';

@Service()
export class Inventory {
  constructor(private inventoryService: InventoryService) {
  }

  @withSDKError({ type: 'INVENTORY_GET_ITEMS_ERROR' })
  public async getItems(input: GetItemsInput) {
    const { data, status } = await this.inventoryService.getItems(input);

    if (status !== 200) {
      throw new Error('INVENTORY_GET_ITEMS_ERROR', { cause: { code: `${status}`, reason: 'unknown' } });
    }

    const items = data.rows;

    return items;
  }
}
