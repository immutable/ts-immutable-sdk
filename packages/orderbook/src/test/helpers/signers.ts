import { providers, Wallet } from 'ethers';
// eslint-disable-next-line
import dotenv from 'dotenv';

dotenv.config();

export function getOffererWallet(provider: providers.Provider): Wallet {
  const offererPrivateKey = process.env.ACCOUNT_1;
  if (!offererPrivateKey) {
    throw new Error('ACCOUNT_1 not set');
  }

  return new Wallet(offererPrivateKey, provider);
}

export function getFulfillerWallet(provider: providers.Provider): Wallet {
  const fulfillerPrivateKey = process.env.ACCOUNT_2;
  if (!fulfillerPrivateKey) {
    throw new Error('ACCOUNT_2 not set');
  }

  return new Wallet(fulfillerPrivateKey, provider);
}
