import type { EventData, EventType } from '../types';
import { asyncFn } from '../utils';
import { withSDKError } from '../Errors';

import { ItemDefinitionService } from './ItemDefinitionService';

/**
 * @internal Assets events
 */
export type ItemDefinitionEvent = EventType<
  'ITEM_DEFINITION',
  | EventData<'STARTED' | 'IN_PROGRESS'>
  | EventData<'COMPLETED', { data: {} }>
  | EventData<'FAILED', { error: { code: string; reason: string } }>
>;

/** List of specific Assets statuses */
export type ItemDefinitionStatus = ItemDefinitionEvent['status'];

export class ItemDefinition {
  public x: string = 'test';
  private emitEvent: (event: ItemDefinitionEvent) => void;
  // private service: ItemDefinitionService;
  private itemDefinitionService: ItemDefinitionService;

  constructor(
    emitEvent: (event: ItemDefinitionEvent) => void,
    service?: ItemDefinitionService
  ) {
    this.emitEvent = emitEvent;
    // FIXME: make injectable
    this.itemDefinitionService = new ItemDefinitionService();
  }

  /**
   * Given inputs for a recipe Assetsing
   * process the recipe by sending it to the backend service
   * @param input Assetsing recipe inputs
   * @returns Assetsing status
   */
  @withSDKError({ type: 'GET_ITEMS_ERROR' })
  public async getItemDefinition(id: string): Promise<ItemDefinitionStatus> {
    this.emitEvent({ status: 'STARTED', action: 'ITEM_DEFINITION' });

    // 1. fetch assets from BE
    // this.emitEvent({ status: 'SUBMITTED', action: 'Assets' });
    const { data, status } = await this.itemDefinitionService.getItemDefinition(
      { id }
    );

    if (status !== 200) {
      this.emitEvent({
        status: 'FAILED',
        action: 'ITEM_DEFINITION',
        error: { code: `${status}`, reason: 'unknown' },
      });
    }

    this.emitEvent({
      status: 'COMPLETED',
      action: 'ITEM_DEFINITION',
      data,
    });

    return 'COMPLETED';
  }
}
