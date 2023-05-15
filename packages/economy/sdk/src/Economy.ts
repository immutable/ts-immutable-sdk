import Container, { Service } from 'typedi';
import { Inventory } from './inventory/Inventory';
import { Recipe } from './recipe/Recipe';

import { SDK } from './SDK';

import { Crafting } from './crafting/Crafting';
import type { CraftEvent } from './crafting/Crafting';
import { ItemDefinition } from './item-definition/ItemDefinition';

/** @internal Economy SDK actions */
export type EconomyEvents = CraftEvent;

@Service()
export class Economy extends SDK<EconomyEvents> {
  constructor(
    public crafting: Crafting,
    public recipe: Recipe,
    public inventory: Inventory,
    public item: ItemDefinition,
  ) {
    super();

    this.setInjectedDeps();
  }

  /** Lifecycle method: Initialises class resources */
  connect(): void {
    this.log('connect');
  }

  static build(): Economy {
    return Container.get(Economy);
  }

  /**
   * Sets injected dependencies required by the SDK services
   */
  private setInjectedDeps(): void {
    const handler = this.getEmitEventHandler();
    Container.set('EmitEventHandler', handler);

    Container.set('SDKConfig', {
      env: 'dev',
    });
  }
}
