import { BytesLike } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { PassportConfiguration } from '../config';
import { FeeOption, RelayerTransaction, TypedDataPayload } from './types';
import { UserZkEvm } from '../types';
import { getEip155ChainId } from './walletHelpers';

export type RelayerClientInput = {
  config: PassportConfiguration,
  jsonRpcProvider: JsonRpcProvider,
  user: UserZkEvm,
};

// JsonRpc base Types
type JsonRpc = {
  id: number;
  jsonrpc: '2.0';
};

// EthSendTransaction types
type EthSendTransactionRequest = {
  method: 'eth_sendTransaction';
  params: {
    to: string;
    data: BytesLike;
    chainId: string;
  }[];
};

type EthSendTransactionResponse = JsonRpc & {
  result: string;
};

// ImGetTransactionByHash types
type ImGetTransactionByHashRequest = {
  method: 'im_getTransactionByHash';
  params: string[];
};

type ImGetTransactionByHashResponse = JsonRpc & {
  result: RelayerTransaction;
};

// ImGetFeeOptions types
type ImGetFeeOptionsRequest = {
  method: 'im_getFeeOptions';
  params: {
    userAddress: string;
    data: BytesLike;
    chainId: string;
  }[];
};

type ImGetFeeOptionsResponse = JsonRpc & {
  result: FeeOption[]
};

// ImSignTypedData types
type ImSignTypedDataRequest = {
  method: 'im_signTypedData';
  params: {
    chainId: string;
    address: string;
    eip712Payload: TypedDataPayload;
  }[];
};

type ImSignTypedDataResponse = JsonRpc & {
  result: string;
};

export type RelayerTransactionRequest =
  | EthSendTransactionRequest
  | ImGetTransactionByHashRequest
  | ImGetFeeOptionsRequest
  | ImSignTypedDataRequest;

export class RelayerClient {
  private readonly config: PassportConfiguration;

  private readonly jsonRpcProvider: JsonRpcProvider;

  private readonly user: UserZkEvm;

  constructor({ config, jsonRpcProvider, user }: RelayerClientInput) {
    this.config = config;
    this.jsonRpcProvider = jsonRpcProvider;
    this.user = user;
  }

  private async postToRelayer<T>(request: RelayerTransactionRequest): Promise<T> {
    const body: RelayerTransactionRequest & JsonRpc = {
      id: 1,
      jsonrpc: '2.0',
      ...request,
    };

    const response = await fetch(`${this.config.relayerUrl}/v1/transactions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const jsonResponse = await response.json();
    if (jsonResponse.error) {
      throw jsonResponse.error;
    }

    return jsonResponse;
  }

  public async ethSendTransaction(to: string, data: BytesLike): Promise<string> {
    const { chainId } = await this.jsonRpcProvider.ready;
    const payload: EthSendTransactionRequest = {
      method: 'eth_sendTransaction',
      params: [{
        to,
        data,
        chainId: getEip155ChainId(chainId),
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
    const { chainId } = await this.jsonRpcProvider.ready;
    const payload: ImGetFeeOptionsRequest = {
      method: 'im_getFeeOptions',
      params: [{
        userAddress,
        data,
        chainId: getEip155ChainId(chainId),
      }],
    };
    const { result } = await this.postToRelayer<ImGetFeeOptionsResponse>(payload);
    return result;
  }

  public async imSignTypedData(address: string, eip712Payload: TypedDataPayload): Promise<string> {
    const { chainId } = await this.jsonRpcProvider.ready;
    const payload: ImSignTypedDataRequest = {
      method: 'im_signTypedData',
      params: [{
        address,
        eip712Payload,
        chainId: getEip155ChainId(chainId),
      }],
    };
    const { result } = await this.postToRelayer<ImSignTypedDataResponse>(payload);
    return result;
  }
}
