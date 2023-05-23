import { Service } from 'typedi';
import { withSDKError } from '../Errors';
import type { EventType } from '../types';

import { StudioBE } from '../StudioBE';

/**
 * @internal Assets events
 */
export type ItemDefinitionEvent = EventType<'ITEM_DEFINITION'>;

/** List of specific Assets statuses */
export type ItemDefinitionStatus = ItemDefinitionEvent['status'];

@Service()
export class ItemDefinition {
  constructor(private studioBE: StudioBE) {}

  @withSDKError({ type: 'ITEM_DEFINITION_ERROR' })
  public async getById(id: string) {
    const { data, status } = await this.studioBE.itemDefinitionApi.definitionsIdGet({ id });

    if (status !== 200) {
      throw new Error('GET_ITEM_DEF_BY_ID_ERROR');
    }

    return data;
  }
}
