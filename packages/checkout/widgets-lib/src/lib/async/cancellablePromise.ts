/**
 * CancellablePromise extends a promise by adding the ability to flag it as cancelled.
 */
export class CancellablePromise<T> {
  public static id = 0;

  public promiseId: number = 0;

  private promise: Promise<T>;

  private isCancelled: boolean = false;

  private onCancel: (() => void) | null = null;

  private rejectPromise: (reason?: any) => void = () => {};

  constructor(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
    CancellablePromise.id += 1;
    this.promiseId = CancellablePromise.id;

    this.promise = new Promise<T>((resolve, reject) => {
      // Save the reject function to use it for cancellation
      this.rejectPromise = reject;

      executor(
        (value) => {
          if (!this.isCancelled) {
            resolve(value);
          } else {
            reject({ cancelled: true });
          }
        },
        (reason) => {
          if (!this.isCancelled) {
            reject(reason);
          } else {
            reject({ cancelled: true });
          }
        },
      );
    });
  }

  static all<T>(values: Array<CancellablePromise<T> | PromiseLike<T>>): CancellablePromise<T[]> {
    return new CancellablePromise<T[]>((resolve, reject) => {
      Promise.all(values.map((value) => {
        if (value instanceof CancellablePromise) {
          return value.promise;
        }
        return value;
      })).then(resolve, reject);
    });
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ): CancellablePromise<TResult1 | TResult2> {
    return new CancellablePromise<TResult1 | TResult2>((resolve, reject) => {
      this.promise.then(
        (value) => (onfulfilled ? resolve(onfulfilled(value)) : resolve(value as unknown as TResult1)),
        (reason) => (onrejected ? resolve(onrejected(reason)) : reject(reason)),
      );
    });
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
  ): CancellablePromise<T | TResult> {
    return this.then(undefined, onrejected);
  }

  finally(onfinally?: (() => void) | undefined | null): CancellablePromise<T> {
    return new CancellablePromise<T>((resolve, reject) => {
      this.promise
        .then(resolve, reject)
        .finally(() => {
          if (onfinally) {
            onfinally();
          }
        });
    });
  }

  public cancel() {
    if (!this.isCancelled) {
      this.isCancelled = true;
      if (this.onCancel) {
        this.onCancel();
      }

      this.rejectPromise({ cancelled: true });
    }
  }

  public onCancelled(callback: () => void) {
    this.onCancel = callback;
  }

  get cancelled() {
    return this.isCancelled;
  }
}
