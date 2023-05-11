import { SDK } from './SDK';
import { Crafting } from './crafting/Crafting';

import type { CraftEvent } from './crafting/Crafting';

/** @internal Economy SDK actions */
export type EconomyEvents = CraftEvent;

export class Economy extends SDK<EconomyEvents> {
  public crafting!: Crafting;

  constructor(crafting?: Crafting) {
    super();
    this.crafting = crafting instanceof Crafting
      ? crafting
      : new Crafting(this.getEmitEventHandler());
  }

  /** Lifecycle method: Self invoked after class instanciation */
  connect(): void {
    this.log('mounted');
  }
}
