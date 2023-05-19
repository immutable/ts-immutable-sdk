import { Service } from 'typedi';
import { RootApiGameIDItemsGetRequest } from '__codegen__/inventory';
import { withSDKError } from '../Errors';

import { InventoryApiService } from './InventoryApiService';

@Service()
export class Inventory {
  constructor(private inventoryApiService: InventoryApiService) {}

  @withSDKError({ type: 'INVENTORY_GET_ITEMS_ERROR' })
  public async getItems(input: RootApiGameIDItemsGetRequest) {
    const { data, status } = await this.inventoryApiService.getItems(input);
    console.log('@@DATA IS ', data);

    if (status !== 200) {
      throw new Error('INVENTORY_GET_ITEMS_ERROR', {
        cause: { code: `${status}`, reason: 'unknown' },
      });
    }

    const items = data.rows;

    return items;
  }
}
