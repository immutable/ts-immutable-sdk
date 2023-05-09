import { SDK } from './SDK';
import { Crafting } from './crafting/Crafting';

import type { CraftEvent } from './crafting/Crafting';
import { Inventory, InventoryEvent } from './inventory/Inventory';

/** @internal Economy SDK actions */
export type EconomyEvents = CraftEvent | InventoryEvent;

export class Economy extends SDK<EconomyEvents> {
  public crafting!: Crafting;
  public inventory!: Inventory;

  constructor(crafting?: Crafting, inventory?: Inventory) {
    super();
    this.crafting =
      crafting instanceof Crafting
        ? crafting
        : new Crafting(this.getEmitEventHandler());
    this.inventory =
      inventory instanceof Inventory
        ? inventory
        : new Inventory(this.getEmitEventHandler());
  }

  /** Lifecycle method: Self invoked after class instanciation */
  connect(): void {
    this.log('mounted');
  }
}
