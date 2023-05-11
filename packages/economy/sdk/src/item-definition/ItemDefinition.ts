import { withSDKError } from '../Errors';
import type { EventType } from '../types';

import { ItemDefinitionService } from './ItemDefinitionService';

/**
 * @internal Assets events
 */
export type ItemDefinitionEvent = EventType<'ITEM_DEFINITION'>;

/** List of specific Assets statuses */
export type ItemDefinitionStatus = ItemDefinitionEvent['status'];

export class ItemDefinition {
  // private service: ItemDefinitionService;
  private itemDefinitionService: ItemDefinitionService;

  constructor() {
    this.itemDefinitionService = new ItemDefinitionService();
  }

  @withSDKError({ type: 'ITEM_DEFINITION_ERROR' })
  public async getById(id: string) {
    // 1. fetch assets from BE
    // this.emitEvent({ status: 'SUBMITTED', action: 'Assets' });
    const { data, status } = await this.itemDefinitionService.getById(id);

    if (status !== 200) {
      throw new Error('GET_ITEM_DEF_BY_ID_ERROR');
    }

    return data;
  }
}
