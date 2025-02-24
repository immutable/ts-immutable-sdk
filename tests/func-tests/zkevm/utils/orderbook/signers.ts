import { Provider, Wallet } from 'ethers';
// eslint-disable-next-line
import dotenv from 'dotenv';

dotenv.config();

export function getBankerWallet(provider: Provider): Wallet {
  const offererPrivateKey = process.env.ORDERBOOK_BANKER_PRIVATE_KEY;
  if (!offererPrivateKey) {
    throw new Error('ACCOUNT_1 not set');
  }

  return new Wallet(offererPrivateKey, provider);
}
