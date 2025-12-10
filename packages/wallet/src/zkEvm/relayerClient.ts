import type { PublicClient, Hex } from 'viem';
import { Auth } from '@imtbl/auth';
import { WalletConfiguration } from '../config';
import { FeeOption, RelayerTransaction, TypedDataPayload } from './types';
import { getEip155ChainId } from './walletHelpers';

export type RelayerClientInput = {
  config: WalletConfiguration,
  rpcProvider: PublicClient,
  auth: Auth
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
    data: Hex | string;
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
    data: Hex | string;
    chainId: string;
  }[];
};

type ImGetFeeOptionsResponse = JsonRpc & {
  result: FeeOption[] | undefined
};

// ImSign types
type ImSignRequest = {
  method: 'im_sign';
  params: {
    chainId: string;
    address: string;
    message: string;
  }[];
};

type ImSignResponse = JsonRpc & {
  result: string;
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
  | ImSignTypedDataRequest
  | ImSignRequest;

export class RelayerClient {
  private readonly config: WalletConfiguration;

  private readonly rpcProvider: PublicClient;

  private readonly auth: Auth;

  constructor({ config, rpcProvider, auth }: RelayerClientInput) {
    this.config = config;
    this.rpcProvider = rpcProvider;
    this.auth = auth;
  }

  private static getResponsePreview(text: string): string {
    return text.length > 100
      ? `${text.substring(0, 50)}...${text.substring(text.length - 50)}`
      : text;
  }

  private async postToRelayer<T>(request: RelayerTransactionRequest): Promise<T> {
    const body: RelayerTransactionRequest & JsonRpc = {
      id: 1,
      jsonrpc: '2.0',
      ...request,
    };

    const user = await this.auth.getUserZkEvm();

    const response = await fetch(`${this.config.relayerUrl}/v1/transactions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();

    if (!response.ok) {
      const preview = RelayerClient.getResponsePreview(responseText);
      throw new Error(`Relayer HTTP error: ${response.status}. Content: "${preview}"`);
    }

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(responseText);
    } catch (parseError) {
      const preview = RelayerClient.getResponsePreview(responseText);
      // eslint-disable-next-line max-len
      throw new Error(`Relayer JSON parse error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}. Content: "${preview}"`);
    }

    if (jsonResponse.error) {
      throw new Error(jsonResponse.error);
    }

    return jsonResponse;
  }

  public getPreferredFeeTokenSymbol(): string {
    return this.config.feeTokenSymbol;
  }

  public async ethSendTransaction(to: string, data: Hex | string): Promise<string> {
    const chainId = await this.rpcProvider.getChainId();
    const payload: EthSendTransactionRequest = {
      method: 'eth_sendTransaction',
      params: [{
        to,
        data,
        chainId: getEip155ChainId(Number(chainId)),
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

  public async imGetFeeOptions(userAddress: string, data: Hex | string): Promise<FeeOption[] | undefined> {
    const chainId = await this.rpcProvider.getChainId();
    const payload: ImGetFeeOptionsRequest = {
      method: 'im_getFeeOptions',
      params: [{
        userAddress,
        data,
        chainId: getEip155ChainId(Number(chainId)),
      }],
    };
    const { result } = await this.postToRelayer<ImGetFeeOptionsResponse>(payload);
    return result;
  }

  public async imSignTypedData(address: string, eip712Payload: TypedDataPayload): Promise<string> {
    const chainId = await this.rpcProvider.getChainId();
    const payload: ImSignTypedDataRequest = {
      method: 'im_signTypedData',
      params: [{
        address,
        eip712Payload,
        chainId: getEip155ChainId(Number(chainId)),
      }],
    };
    const { result } = await this.postToRelayer<ImSignTypedDataResponse>(payload);
    return result;
  }

  public async imSign(address: string, message: string): Promise<string> {
    const chainId = await this.rpcProvider.getChainId();
    const payload: ImSignRequest = {
      method: 'im_sign',
      params: [{
        address,
        message,
        chainId: getEip155ChainId(Number(chainId)),
      }],
    };
    const { result } = await this.postToRelayer<ImSignResponse>(payload);
    return result;
  }
}
