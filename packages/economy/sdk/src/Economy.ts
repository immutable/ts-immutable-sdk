import { Inventory } from './inventory/Inventory';
import { Recipe } from './recipe/Recipe';

import { SDK } from './SDK';

import { Crafting } from './crafting/Crafting';
import type { CraftEvent } from './crafting/Crafting';
import { ItemDefinition } from './item-definition/ItemDefinition';

/** @internal Economy SDK actions */
export type EconomyEvents = CraftEvent;

export class Economy extends SDK<EconomyEvents> {
  public crafting!: Crafting;

  public recipe!: Recipe;

  public inventory!: Inventory;

  public item!: ItemDefinition;

  constructor() {
    super();
    this.crafting = new Crafting(this.getEmitEventHandler());
    this.recipe = new Recipe();
    this.inventory = new Inventory();
    this.item = new ItemDefinition();
  }

  /** Lifecycle method: Self invoked after class instanciation */
  connect(): void {
    this.log('mounted');
  }
}
