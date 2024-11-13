import { JsonRpcProvider } from 'ethers';

function delay(ms: number): Promise<undefined> {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class RetryProvider extends JsonRpcProvider {
  private retryCount: number;

  private retryDelay: number;

  constructor(url: string) {
    super(url);
    this.retryCount = 3; // Number of retries
    this.retryDelay = 200; // Delay in ms
  }

  async send(method: any, params: any): Promise<any> {
    for (let i = 0; i < this.retryCount; i++) {
      try {
        // eslint-disable-next-line no-await-in-loop
        return await super.send(method, params);
      } catch (error: any) {
        if (i === this.retryCount - 1) {
          throw error;
        }

        // eslint-disable-next-line no-await-in-loop
        await delay(this.retryDelay);
      }
    }

    return undefined;
  }
}
