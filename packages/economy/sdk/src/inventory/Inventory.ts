import { Service } from 'typedi';

import { StudioBE } from '../StudioBE';
import { withSDKError } from '../Errors';
import { Store } from '../Store';

import { RootApiGameIDItemsGetRequest } from '../__codegen__/inventory';
import type { InventoryItem } from '../__codegen__/inventory';

@Service()
export class Inventory {
  constructor(private studioBE: StudioBE, private store: Store) {}

  @withSDKError({ type: 'INVENTORY_GET_ITEMS_ERROR' })
  public async getItems(input: RootApiGameIDItemsGetRequest) {
    const { data, status } = await this.studioBE.inventoryApi.gameIDItemsGet(
      input,
    );

    if (!(status >= 200 && status < 300)) {
      throw new Error('INVENTORY_GET_ITEMS_ERROR', {
        cause: { code: `${status}`, reason: 'unknown' },
      });
    }

    this.store.set((state) => {
      state.inventory = data.rows || [];
    });

    const items = data.rows;

    return items;
  }

  public filterItemsBy(
    items: InventoryItem[],
    predicate: (value?: InventoryItem, index?: number, list?: InventoryItem[]) => boolean,
  ) {
    return items.filter(predicate);
  }
}
