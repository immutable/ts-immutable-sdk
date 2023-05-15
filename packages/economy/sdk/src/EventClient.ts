/* eslint-disable no-console */
import { Subject, Subscription } from 'rxjs';
import { Service } from 'typedi';
import { EconomyCustomEventTypes } from './types';

@Service()
export class EventClient<EventType> {
  /** Produces events so consumer can hook into the SDK workflow */
  private events$$ = new Subject<EventType>();

  /** events subscription for later disconnect */
  private eventsSubscription!: Subscription;

  /** events as observable */
  private get events$() {
    return this.events$$.asObservable();
  }

  /** Utility: Unsubscribe from events */
  public disconnect(): void {
    this?.eventsSubscription?.unsubscribe();
  }

  /** Utility: Subscribe to events */
  public subscribe(handler: (event: EventType) => void): Subscription {
    this.eventsSubscription = this.events$.subscribe(handler);
    return this.eventsSubscription;
  }

  /**
   * Notify observers of a event
   * @param type action event type
   * @param status action event status
   */
  public emitEvent(event: EventType): void {
    this.emitNativeEvent(event);
    this.events$$.next(event);
  }

  /**
   * Notify DOM listeners of a event
   * @param detail event payload
   */
  private emitNativeEvent(detail: EventType): void {
    if (!EventClient.isClientSide()) {
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
  static isClientSide(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  /** Utility: Use to print logs in console */
  private log(...args: unknown[]): void {
    console.log(`${this.constructor.name}:`, ...args);
  }
}

export default EventClient;
