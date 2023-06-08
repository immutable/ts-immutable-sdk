import { BytesLike } from 'ethers';
import { PassportConfiguration } from '../config';
import { FeeOption, RelayerTransaction } from './types';

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
export type EthSendTransactionParams = {
  to: string;
  data: BytesLike;
};

type EthSendTransactionRequest = {
  method: 'eth_sendTransaction';
  params: {
    to: string;
    data: BytesLike;
    chainId: string;
  }[];
};

type EthSendTransactionResponse = {
  result: string;
};

// ImGetTransactionByHash types
type ImGetTransactionByHashRequest = {
  method: 'im_getTransactionByHash';
  params: string[];
};

type ImGetTransactionByHashResponse = JsonRpcResponse & {
  result: RelayerTransaction;
};

type ImGetFeeOptionsRequest = {
  method: 'im_getFeeOptions';
  params: {
    userAddress: string;
    data: BytesLike;
    chainId: string;
  }[];
};

type ImGetFeeOptionsResponse = JsonRpcResponse & {
  result: {
    token_price: string;
    token_symbol: string;
    token_decimals: number;
    token_address: string;
    recipient: string;
  }[]
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
    const body: RelayerTransactionRequest & JsonRpcRequest = {
      id: 1,
      jsonrpc: '2.0',
      ...request,
    };

    const response = await fetch(`${this.config.relayerUrl}/v1/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const jsonResponse = await response.json();
    if (jsonResponse.error) {
      return Promise.reject(jsonResponse.error);
    }

    return jsonResponse;
  }

  public async ethSendTransaction(params: EthSendTransactionParams): Promise<string> {
    const payload: EthSendTransactionRequest = {
      method: 'eth_sendTransaction',
      params: [{
        to: params.to,
        data: params.data,
        chainId: this.config.zkEvmChainId.toString(),
      }],
    };
    const { result } = await this.postToRelayer<EthSendTransactionResponse>(payload);
    return result;
  }

  public async imGetTransactionByHash(hash: string): Promise<RelayerTransaction> {
    const payload: ImGetTransactionByHashRequest = {
      method: 'im_getTransactionByHash',
      params: [hash],
    };
    const { result } = await this.postToRelayer<ImGetTransactionByHashResponse>(payload);
    return result;
  }

  public async imGetFeeOptions(userAddress: string, data: BytesLike): Promise<FeeOption[]> {
    const payload: ImGetFeeOptionsRequest = {
      method: 'im_getFeeOptions',
      params: [{
        userAddress,
        data,
        chainId: this.config.zkEvmChainId.toString(),
      }],
    };
    const { result } = await this.postToRelayer<ImGetFeeOptionsResponse>(payload);
    return result.map((feeOption): FeeOption => ({
      tokenPrice: feeOption.token_price,
      tokenSymbol: feeOption.token_symbol,
      tokenDecimals: feeOption.token_decimals,
      tokenAddress: feeOption.token_address,
      recipient: feeOption.recipient,
    }));
  }
}
