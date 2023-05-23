/* eslint-disable class-methods-use-this */
import Container, { Service } from 'typedi';
import { Subscription } from 'rxjs';
import { Inventory } from './inventory/Inventory';
import { Recipe } from './recipe/Recipe';

import { Crafting } from './crafting/Crafting';
import type { CraftEvent } from './crafting/Crafting';
import { ItemDefinition } from './item-definition/ItemDefinition';
import { EventClient } from './EventClient';
import { Config, defaultConfig } from './Config';

/** @internal Economy SDK actions */
export type EconomyEvents = CraftEvent;

@Service()
export class Economy {
  static build(config = defaultConfig): Economy {
    Container.set(Config, new Config(config));
    return Container.get(Economy);
  }

  constructor(
    public config: Config,
    private events: EventClient<EconomyEvents>,
    public crafting: Crafting,
    public recipe: Recipe,
    public inventory: Inventory,
    public item: ItemDefinition,
  ) {}

  public connect(): void {
    // TODO: Initialize all services
    this.log('connected', { config: this.config.get() });
  }

  public subscribe(handler: (event: EconomyEvents) => void): Subscription {
    return this.events.subscribe(handler);
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
