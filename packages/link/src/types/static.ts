import { BigNumber } from '@ethersproject/bignumber';
import { PopulatedTransaction } from '@ethersproject/contracts';
import BN from 'bn.js';

export interface BalanceInfo {
  balance: BigNumber;
  decimal: number;
}

export type StarkwareAccountMapping = {
  [path: string]: string;
};

export type Store = {
  set(key: string, data: any): Promise<void>;
  get(key: string): Promise<any>;
  remove(key: string): Promise<void>;
};

export type SignatureOptions = {
  r: BN;
  s: BN;
  recoveryParam: number | null | undefined;
};

export type BotEnvironment = {
  numberOfBots: number;
  etherscanApiKey: string;
  testUserPrivateKey: string;
  testUserPrivateKey2: string;
  testUserStartingVaultId: number;
  testUserToken: number;
  imxHost: string;
  tokenAddress: string;
  stark: {
    layer: string;
    application: string;
    contractAddress: string;
  };
};

export type ApiResult = {
  code: number;
  message: string;
  result: any;
};

export type Transaction = PopulatedTransaction;

export type ExchangeProvider = 'moonpay' | 'layerswap';

export class LinkError extends Error {
  constructor(public code: number, message?: string) {
    super(message ?? '');
    Object.setPrototypeOf(this, LinkError.prototype);
  }
}
