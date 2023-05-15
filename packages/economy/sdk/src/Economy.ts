/* eslint-disable class-methods-use-this */
import Container, { Service } from 'typedi';
import { Subscription } from 'rxjs';
import { Inventory } from './inventory/Inventory';
import { Recipe } from './recipe/Recipe';

import { Crafting } from './crafting/Crafting';
import type { CraftEvent } from './crafting/Crafting';
import { ItemDefinition } from './item-definition/ItemDefinition';
import { Events } from './Events';
import { Configuration, Config } from './Config';

/** @internal Economy SDK actions */
export type EconomyEvents = CraftEvent;

@Service()
export class Economy {
  static build(config?: Configuration): Economy {
    if (config) {
      Container.get(Config).set(config);
    }

    return Container.get(Economy);
  }

  constructor(
    private events: Events<EconomyEvents>,
    public config: Config,
    public crafting: Crafting,
    public recipe: Recipe,
    public inventory: Inventory,
    public item: ItemDefinition,
  ) {}

  public connect(): void {
    // TODO: Initialize all services
    this.log('connected', this.config.get());
  }

  public subscribe(handler: (event: EconomyEvents) => void): Subscription {
    return this.events.subscribe((handler));
  }

  public disconnect(): void {
    this.events.disconnect();
  }

  /** Utility: Use to print logs in console */
  private log(...args: unknown[]): void {
    // eslint-disable-next-line no-console
    console.log(`${this.constructor.name}:`, ...args);
  }
}
