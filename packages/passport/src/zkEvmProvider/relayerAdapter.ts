import { PassportConfiguration } from '../config';

export type RelayerAdapterInput = {
  config: PassportConfiguration,
};

// JsonRpc base Types

type JsonRpcRequest = {
  id: number;
  jsonrpc: '2.0';
};

type JsonRpcResponse = {
  id: number;
  jsonrpc: '2.0';
};

// EthSendTransaction types

type EthSendTransactionParams = {
  to: string;
  data: string;
};

type EthSendTransactionRequest = JsonRpcRequest & {
  method: 'eth_sendTransaction';
  params: {
    to: string;
    data: string;
    chainId: string;
  }[];
};

type EthSendTransactionResponse = JsonRpcResponse & {
  result: string;
};

// ImGetTransactionByHash types

type ImGetTransactionByHashParams = string;

type ImGetTransactionByHashRequest = JsonRpcRequest & {
  method: 'im_getTransactionByHash';
  params: ImGetTransactionByHashParams[];
};

type Transaction = {
  status: 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'ERROR';
  chainId: string;
  relayerId: string;
  hash: string;
};

type ImGetTransactionByHashResponse = JsonRpcResponse & {
  result: Transaction;
};

// ImGetFeeOptions types

type ImGetFeeOptionsParams = {
  userAddress: string;
  data: string;
  chainId: string;
};

type ImGetFeeOptionsRequest = JsonRpcRequest & {
  method: 'im_getFeeOptions';
  params: ImGetFeeOptionsParams[];
};

type FeeOptions = {
  token_price: string;
  token_symbol: string;
  token_decimals: number;
  token_address: string;
};

type ImGetFeeOptionsResponse = JsonRpcResponse & {
  result: FeeOptions[]
};

type RelayerTransactionRequest =
  | EthSendTransactionRequest
  | ImGetTransactionByHashRequest
  | ImGetFeeOptionsRequest;

export class RelayerAdapter {
  private readonly config: PassportConfiguration;

  constructor({ config }: RelayerAdapterInput) {
    this.config = config;
  }

  private async postToRelayer<T>(request: RelayerTransactionRequest): Promise<T> {
    return fetch(`${this.config.relayerUrl}/v1/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }).then((response) => response.json())
      .then((response) => response as T);
  }

  public async ethSendTransaction(params: EthSendTransactionParams): Promise<EthSendTransactionResponse> {
    const payload: EthSendTransactionRequest = {
      id: 1, // TODO: How do we generate this?
      jsonrpc: '2.0',
      method: 'eth_sendTransaction',
      params: [{
        to: params.to,
        data: params.data,
        chainId: this.config.zkEvmChainId.toString(),
      }],
    };
    return this.postToRelayer<EthSendTransactionResponse>(payload);
  }

  public async imGetTransactionByHash(hash: string): Promise<ImGetTransactionByHashResponse> {
    const payload: ImGetTransactionByHashRequest = {
      id: 1, // TODO: How do we generate this?
      jsonrpc: '2.0',
      method: 'im_getTransactionByHash',
      params: [hash],
    };
    return this.postToRelayer<ImGetTransactionByHashResponse>(payload);
  }

  public async imGetFeeOptions(userAddress: string, data: string): Promise<ImGetFeeOptionsResponse> {
    const payload: ImGetFeeOptionsRequest = {
      id: 1, // TODO: How do we generate this?
      jsonrpc: '2.0',
      method: 'im_getFeeOptions',
      params: [{
        userAddress,
        data,
        chainId: this.config.zkEvmChainId.toString(),
      }],
    };
    return this.postToRelayer<ImGetFeeOptionsResponse>(payload);
  }
}
