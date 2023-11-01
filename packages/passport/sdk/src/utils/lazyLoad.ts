export default class LazyLoad<T, Dependency = void> {
  private readonly resolvedValue: Promise<T>;

  constructor(promiseToAwait: () => Promise<Dependency>, initialiseFunction: (args?: Dependency) => T) {
    this.resolvedValue = promiseToAwait()
      .then((args) => initialiseFunction(args));
  }

  public getResolvedValue(): Promise<T> {
    return this.resolvedValue;
  }
}
