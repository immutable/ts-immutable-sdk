import { Subject, Subscription } from 'rxjs';

import { EconomyCustomEventTypes } from './types';

/** @public Standard SDK Configuration interface */
export type Configuration = {
  env: 'production' | 'dev';
};

/**
 * @private Default SDK Configuration
 */
const defaultConfig: Configuration = {
  env: 'dev',
};

/**
 * Base class from which all SDK classes inherit a common interface
 * with default lifecycle implementations
 */
export abstract class SDK<SDKEvent> {
  constructor(protected config = defaultConfig) {
    this.config = config;
    this.connect();
  }

  /** Produces lifecycle events so consumer can hook into the SDK workflow */
  private events$$ = new Subject<SDKEvent>();

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
    // eslint-disable-next-line no-console
    console.log(`${this.constructor.name}:`, ...args);
  }

  /** Utility: Getter to protected config object */
  public getConfig(): Configuration {
    return this.config;
  }

  /** Utility: Subscribe to craft and purchase events */
  subscribe(handler: (event: SDKEvent) => void): Subscription {
    this.eventsSubscription = this.events$.subscribe(handler);
    return this.eventsSubscription;
  }

  /**
   * Notify observers of a lifecycle event
   * @param type action event type
   * @param status action event status
   */
  protected emitEvent(event: SDKEvent): void {
    this.emitNativeEvent(event);
    this.events$$.next(event);
  }

  /**
   * Notify DOM listeners of a lifecycle event
   * @param detail event payload
   */
  private emitNativeEvent(detail: SDKEvent): void {
    if (!SDK.isClientSide) {
      this.log(
        'Cannot dispatch native event: not running in a browser environment',
      );
      return;
    }

    const event = new CustomEvent(EconomyCustomEventTypes.DEFAULT, {
      detail,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
  }

  /**
   * Utility: Checks if the class was mounted in a browser environment
   */
  protected static get isClientSide(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  /**
   * Produce an event handler callback that can be passed to SDK functions
   * to allow them to trigger SDK events that will bubble up to subscriber
   * @param type EconomySDKEvent
   * @returns Function that will emit an event
   */
  protected getEmitEventHandler() {
    const handler = (event: SDKEvent) => this.emitEvent(event);
    return handler.bind(this);
  }
}
