
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/providers';

// todo: move to common
export function getEnv(name: string, defaultValue?: string): string {
  const value = process.env[name];

  if (value !== undefined) {
    return value;
  } else if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw new Error(`Environment variable '${name}' not set`);
}

export const env = {
  network: getEnv('NETWORK'),
  alchemyApiKey: getEnv('ALCHEMY_API_KEY'),
  client: {
    publicApiUrl: getEnv('PUBLIC_API_URL'),
    starkContractAddress: getEnv('STARK_CONTRACT_ADDRESS'),
    registrationContractAddress: getEnv('REGISTRATION_CONTRACT_ADDRESS'),
  },
  privateKey1: getEnv('PRIVATE_KEY1'),
  starkPrivateKey1: getEnv('STARK_PRIVATE_KEY1'),
  privateKey2: getEnv('PRIVATE_KEY2'),
  privateKeyBanker: getEnv('PRIVATE_KEY_BANKER'),
  starkPrivateKeyBanker: getEnv('STARK_PRIVATE_KEY_BANKER'),
  tokenAddress: getEnv('TOKEN_ADDRESS'),
  moonpayWebhookKey: getEnv('MOONPAY_WEBHOOK_KEY'),
  starkExBatchSize: parseInt(getEnv('STARKEX_BATCH_SIZE'), 10),
  unregisteredUserPrivateKey: getEnv('UNREGISTERED_USER_PRIVATE_KEY'),
  unregisteredUserStarkPrivateKey: getEnv('UNREGISTERED_USER_STARK_PRIVATE_KEY'),
};

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
    async  <T>(
      f: () => Promise<T>,
      waitForF: (result: T) => boolean = () => true,
    ) => {
      const startedAt = Date.now();
      while (true) {
        process.stdout.write('.');

        try {
          const result = await f();
          if (!waitForF(result)) {
            throw new Error('Data not available');
          } else {
            break;
          }
        } catch (e) {
          if (Date.now() - startedAt >= timeout * 1000) {
            return Promise.reject(e);
          }
          await sleep(1000);
        }
      }
    };

export const repeatCheck600 = repeatCheck(600);
export const repeatCheck300 = repeatCheck(300);
export const repeatCheck30 = repeatCheck(30);
export const repeatCheck20 = repeatCheck(20);
export const repeatCheck10 = repeatCheck(10);
export const repeatCheck5 = repeatCheck(5);