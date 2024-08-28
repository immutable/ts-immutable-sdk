/* eslint-disable no-underscore-dangle */
import { Logger } from 'oidc-client-ts';

export type Callback<EventType extends unknown[]> = (...ev: EventType) => (Promise<void> | void);

export class Event<EventType extends unknown[]> {
  protected readonly _logger: Logger;

  private readonly _callbacks: Array<Callback<EventType>> = [];

  public constructor(protected readonly _name: string) {
    this._logger = new Logger(`Event('${this._name}')`);
  }

  public addHandler(cb: Callback<EventType>): () => void {
    this._callbacks.push(cb);
    return () => this.removeHandler(cb);
  }

  public removeHandler(cb: Callback<EventType>): void {
    const idx = this._callbacks.lastIndexOf(cb);
    if (idx >= 0) {
      this._callbacks.splice(idx, 1);
    }
  }

  public async raise(...ev: EventType): Promise<void> {
    this._logger.debug('raise:', ...ev);
    for (const cb of this._callbacks) {
      // eslint-disable-next-line no-await-in-loop
      await cb(...ev);
    }
  }
}
