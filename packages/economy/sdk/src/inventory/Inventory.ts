import { Service } from 'typedi';
import { List } from 'linqts';
import { withSDKError } from '../Errors';
import { GetItemsInput, InventoryService } from './InventoryService';
import { InventoryItem } from '../__codegen__/inventory';

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

  public static filterItemsBy(
    items: InventoryItem[],
    predicate: (value?: InventoryItem, index?: number, list?: InventoryItem[]) => boolean,
  ) {
    return new List<InventoryItem>(items).Where(predicate).ToArray();
  }
}
