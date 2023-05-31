import Container, { Service } from 'typedi';
import { Subscription } from 'rxjs';
import { Inventory } from './inventory/Inventory';
import { Recipe } from './recipe/Recipe';

import { Crafting } from './crafting/Crafting';
import type { CraftEvent } from './crafting/Crafting';
import { ItemDefinition } from './item-definition/ItemDefinition';
import { EventClient } from './EventClient';
import { Config, defaultConfig } from './Config';
import { Store, defaultState } from './Store';

/** @internal Economy SDK actions */
export type EconomyEvents = CraftEvent;

@Service()
export class Economy {
  static build(config = defaultConfig): Economy {
    Container.set(Config, new Config(config));
    Container.set(Store, new Store(defaultState));
    return Container.get(Economy);
  }

  constructor(
    public config: Config,
    private events: EventClient<EconomyEvents>,
    public crafting: Crafting,
    public recipe: Recipe,
    public inventory: Inventory,
    public item: ItemDefinition,
    private store: Store,
  ) {}

  public async connect() {
    const config = this.config.get();

    const inventory$ = this.inventory.getItems({
      gameID: config.gameId,
      owner: [config.walletAddress || config.userId],
    });

    const recipes$ = this.recipe.getAll({
      gameId: config.gameId,
    });

    await Promise.all([inventory$, recipes$]);
  }

  public subscribe(handler: (event: EconomyEvents) => void): Subscription {
    return this.events.subscribe(handler);
  }

  public disconnect(): void {
    this.events.disconnect();
  }

  public get state() {
    return this.store.get();
  }

  public resetState() {
    this.store.reset();
  }

  /** Utility: Use to print logs in console */
  private log(...args: unknown[]): void {
    console.log(`${this.constructor.name}:`, ...args);
  }
}
