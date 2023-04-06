import { Subject, Subscription } from 'rxjs';

import type { EventStatus, IEventType } from './types';

/** Standard SDK Configuration interface */
export type Configuration = {
  env: 'production' | 'dev';
};

const defaultConfig: Configuration = {
  env: 'dev',
};

/**
 * Base class from which all SDK classes inherit a common interface
 * with default lifecycle implementations
 */
export abstract class SDK<ActionType extends string> {
  constructor(protected config = defaultConfig) {
    this.config = config;
    this.connect();
  }

  /** Produces lifecycle events so consumer can hook into the SDK workflow */
  private events$$ = new Subject<IEventType<ActionType>>();
  private eventsSubscription!: Subscription;

  private get events$() {
    return this.events$$.asObservable();
  }

  /**
   * Lifecycle: Use to bootstrap initialisation
   */
  abstract connect(): void;

  /**
   * Lifecycle: Use to clean up the resources before class instance is destroyed
   */
  public disconnect(): void {
    this?.eventsSubscription?.unsubscribe();
  }

  /** Utility: Use to print logs in console */
  log(...args: unknown[]): void {
    console.log(`${this.constructor.name}:`, ...args);
  }

  /** Utility: Getter to protected config object */
  public getConfig(): Configuration {
    return this.config;
  }

  /** Utility: Subscribe to craft and purchase events */
  subscribe(handler: (event: IEventType<ActionType>) => void): Subscription {
    this.eventsSubscription = this.events$.subscribe(handler);
    return this.eventsSubscription;
  }

  /**
   * Notify observers of lifecycle event
   * @param type action event type
   * @param status action event status
   */
  protected emitEvent<S extends EventStatus>(
    type: ActionType,
    status: S
  ): void {
    this.events$$.next({ type, status });
  }

  /**
   * Produce an event handler callback that can be passed to SDK functions
   * to allow them to trigger SDK events that will bubble up to subscriber
   * @param type EconomyEventType
   * @returns Function that will emit an event
   */
  protected getEmitEventHandler<T extends ActionType>(type: T) {
    const handler = <Status>(status: Status) =>
      this.emitEvent(type, status as EventStatus);
    return handler.bind(this);
  }
}
