import { List } from 'linqts';
import { Service } from 'typedi';

import { StudioBE } from '../StudioBE';
import { withSDKError } from '../Errors';
import { InventoryItem, RootApiGameIDItemsGetRequest } from '../__codegen__/inventory';

@Service()
export class Inventory {
  constructor(private studioBE: StudioBE) {}

  @withSDKError({ type: 'INVENTORY_GET_ITEMS_ERROR' })
  public async getItems(input: RootApiGameIDItemsGetRequest) {
    const { data, status } = await this.studioBE.inventoryApi.gameIDItemsGet(
      input,
    );

    if (status !== 200) {
      throw new Error('INVENTORY_GET_ITEMS_ERROR', {
        cause: { code: `${status}`, reason: 'unknown' },
      });
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
