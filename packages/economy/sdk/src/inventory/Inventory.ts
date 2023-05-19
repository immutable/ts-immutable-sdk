import { Service } from 'typedi';
import { RootApiGameIDItemsGetRequest } from '__codegen__/inventory';
import { withSDKError } from '../Errors';

import { StudioBE } from '../StudioBE';

@Service()
export class Inventory {
  constructor(private studioBE: StudioBE) {}

  @withSDKError({ type: 'INVENTORY_GET_ITEMS_ERROR' })
  public async getItems(input: RootApiGameIDItemsGetRequest) {
    const { data, status } = await this.studioBE.inventoryApi.gameIDItemsGet(
      input
    );

    if (status !== 200) {
      throw new Error('INVENTORY_GET_ITEMS_ERROR', {
        cause: { code: `${status}`, reason: 'unknown' },
      });
    }

    const items = data.rows;

    return items;
  }
}
