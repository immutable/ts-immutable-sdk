type StringEventKey<T> = Extract<keyof T, string>;

type AnyListener = (...args: any[]) => void;
type EventArgs<TEvents, TEventName extends keyof TEvents> =
  TEvents[TEventName] extends readonly [...infer A]
    ? [...A]
    : TEvents[TEventName] extends readonly any[]
      ? [...TEvents[TEventName]]
      : [TEvents[TEventName]];

export default class TypedEventEmitter<TEvents extends Record<string, any>> {
  private listeners = new Map<StringEventKey<TEvents>, Set<AnyListener>>();

  emit<TEventName extends StringEventKey<TEvents>>(
    eventName: TEventName,
    ...eventArg: EventArgs<TEvents, TEventName>
  ) {
    const handlers = this.listeners.get(eventName);
    if (!handlers || handlers.size === 0) {
      return;
    }

    // Copy handlers to avoid issues if listeners mutate during emit
    [...handlers].forEach((handler) => {
      handler(...eventArg);
    });
  }

  on<TEventName extends StringEventKey<TEvents>>(
    eventName: TEventName,
    handler: (...eventArg: EventArgs<TEvents, TEventName>) => void,
  ) {
    const handlers = this.listeners.get(eventName) ?? new Set<AnyListener>();
    handlers.add(handler as AnyListener);
    this.listeners.set(eventName, handlers);
  }

  removeListener<TEventName extends StringEventKey<TEvents>>(
    eventName: TEventName,
    handler: (...eventArg: EventArgs<TEvents, TEventName>) => void,
  ) {
    const handlers = this.listeners.get(eventName);
    if (!handlers) {
      return;
    }
    handlers.delete(handler as AnyListener);
    if (handlers.size === 0) {
      this.listeners.delete(eventName);
    }
  }
}
