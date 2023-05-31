import { TransactionResponse } from '@ethersproject/abstract-provider';
import { PassportConfiguration } from '../config';

export type RelayerAdapterInput = {
  config: PassportConfiguration,
};

export type ListTransactionsRequest = {
  filter: {
    chainId: string;
    wallet: string;
  }
};

export type ListTransactionsResponse = {
  cursor: string;
  remaining: Number;
  // TODO: Replace with our own transaction definition
  transactions: TransactionResponse[];
};

export type TransactionRequest = {
  id: number;
  jsonrpc: string;
  method: string;
  // TODO: Replace with our own transaction definition
  params: TransactionRequest;
};

export enum FeeTokenType {
  UNKNOWN = 'UNKNOWN',
  ERC20_TOKEN = 'ERC20_TOKEN',
}

export type FeeToken = {
  chainId: string;
  name: string;
  symbol: string;
  type: FeeTokenType;
};

export type Fee = {
  value: string;
  to: string;
  token: FeeToken;
  // gasLimit: number;
};

export type Quote = {
  options: Fee[];
};

export type QuoteResponse = {
  id: number;
  jsonrpc: string;
  result?: Quote;
  error?: Error;
};

export class RelayerAdapter {
  private readonly config: PassportConfiguration;

  constructor({ config }: RelayerAdapterInput) {
    this.config = config;
  }

  private async postToRelayer<T>(path: string, request: object): Promise<T> {
    return fetch(`${this.config.relayerUrl}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }).then((response) => response.json());
  }

  public async listTransactions(wallet: string): Promise<ListTransactionsResponse> {
    const listWalletRequest: ListTransactionsRequest = {
      filter: {
        chainId: this.config.zkEvmChainId.toString(),
        wallet,
      },
    };

    // TODO: Validate endpoint
    return this.postToRelayer<ListTransactionsResponse>('listTransactions', listWalletRequest);
  }

  public async getQuote(transactionRequest: TransactionRequest): Promise<QuoteResponse> {
    // TODO: Validate endpoint
    return this.postToRelayer<QuoteResponse>('getQuote', transactionRequest);
  }

  // TODO: Replace with our own transaction definition
  public async execute(transactionRequest: TransactionRequest): Promise<TransactionResponse> {
    return this.postToRelayer<TransactionResponse>('execute', transactionRequest);
  }
}
