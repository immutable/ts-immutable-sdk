import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/providers';
import {CallOverrides} from "@ethersproject/contracts";

export const waitForTransactionResponse = async (
  response: TransactionResponse,
): Promise<TransactionReceipt> => {
  const txId = response.hash;
  console.log('Waiting for transaction', {
    txId,
    etherscanLink: `https://goerli.etherscan.io/tx/${txId}`,
    alchemyLink: `https://dashboard.alchemyapi.io/mempool/eth-goerli/tx/${txId}`,
  });
  const receipt = await response.wait();
  if (receipt.status === 0) {
    throw new Error(JSON.stringify(receipt));
  }
  console.log('Transaction Mined: ' + receipt.blockNumber);
  return receipt;
};

export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

// Repeated check if a function returns a rejected promise every seconds.
// It resolves when that function resolves and if the waitFor function returns true.
// There is latency in database sync that happens between Engine and Public API. If an expected data has not returned yet,
// it will keep retrying.
// It returns rejected promise when timeout.
export const repeatCheck =
  (timeout: number) =>
  async <T>(
    f: () => Promise<T>,
    waitForF: (result: T) => boolean = () => true,
  ) => {
    return new Promise((resolve, reject) => {
      // track the last rejection so we can throw it if we timeout
      let lastRejection: any | undefined;

      // reject the promise asynchronously after timeout
      const t = setTimeout(() => {
        if (lastRejection) {
          reject(
            `Timeout in repeatCheck after ${timeout} seconds. Last error: ${lastRejection}`,
          );
          return;
        }
        reject(new Error(`Timeout in repeatCheck after ${timeout} seconds`));
      }, timeout * 1000);

      const check = async () => {
        try {
          const result = await f();
          if (waitForF(result)) {
            clearTimeout(t);
            resolve(result);
            return;
          }

          lastRejection = new Error(
            'waitForF returned false for result: ' + JSON.stringify(result),
          );
        } catch (e: any) {
          lastRejection = e;
        }

        // if we've not resolved yet, check again in a second
        setTimeout(check, 1000);
      };

      // check immediately
      check();
    });
  };

export const repeatCheck600 = repeatCheck(600);
export const repeatCheck300 = repeatCheck(300);
export const repeatCheck30 = repeatCheck(30);
export const repeatCheck20 = repeatCheck(20);
export const repeatCheck10 = repeatCheck(10);
export const repeatCheck5 = repeatCheck(5);

export function promiseTimeout<T>(
  handler: Promise<T>,
  timeout?: number,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => {
      reject(new Error('Promise timed out'));
    }, timeout || 1000 * 10);
    handler
      .then((value: T) => {
        clearTimeout(t);
        resolve(value);
      })
      .catch((ex: any) => {
        clearTimeout(t);
        reject(ex);
      });
  });
}

export const defaultGasOverrides: CallOverrides = {
  maxPriorityFeePerGas: 10e9, // 10 Gwei
  maxFeePerGas: 15e9,
};
