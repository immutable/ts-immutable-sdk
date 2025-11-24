import { BytesLike, JsonRpcProvider } from 'ethers';
import AuthManager from '../authManager';
import { PassportConfiguration } from '../config';
import { FeeOption, RelayerTransaction, TypedDataPayload } from './types';

export type RelayerClientInput = {
  config: PassportConfiguration,
  rpcProvider: JsonRpcProvider,
  authManager: AuthManager
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

/**
 * RelayerClient for Arbitrum One
 * Similar to zkEVM RelayerClient but works with Arbitrum One chain
 */
export class ArbOneRelayerClient {
  private readonly config: PassportConfiguration;

  private readonly rpcProvider: JsonRpcProvider;

  private readonly authManager: AuthManager;

  constructor({ config, rpcProvider, authManager }: RelayerClientInput) {
    this.config = config;
    this.rpcProvider = rpcProvider;
    this.authManager = authManager;
  }

  private static getResponsePreview(text: string): string {
    return text.length > 100
      ? `${text.substring(0, 50)}...${text.substring(text.length - 50)}`
      : text;
  }

  private getEip155ChainId(chainId: number): string {
    return `eip155:${chainId}`;
  }

  private async postToRelayer<T>(request: RelayerTransactionRequest): Promise<T> {
    const body: RelayerTransactionRequest & JsonRpc = {
      id: 1,
      jsonrpc: '2.0',
      ...request,
    };

    const user = await this.authManager.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // TODO: Update this URL when backend adds ArbOne support
    // For now, using the same relayer URL but backend will need to support ArbOne chain
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
      const preview = ArbOneRelayerClient.getResponsePreview(responseText);
      throw new Error(`Relayer HTTP error: ${response.status}. Content: "${preview}"`);
    }

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(responseText);
    } catch (parseError) {
      const preview = ArbOneRelayerClient.getResponsePreview(responseText);
      throw new Error(`Relayer JSON parse error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}. Content: "${preview}"`);
    }

    if (jsonResponse.error) {
      throw new Error(jsonResponse.error);
    }

    return jsonResponse;
  }

  public async ethSendTransaction(to: string, data: BytesLike): Promise<string> {
    const { chainId } = await this.rpcProvider.getNetwork();
    const payload: EthSendTransactionRequest = {
      method: 'eth_sendTransaction',
      params: [{
        to,
        data,
        chainId: this.getEip155ChainId(Number(chainId)),
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

  public async imGetFeeOptions(userAddress: string, data: BytesLike): Promise<FeeOption[] | undefined> {
    const { chainId } = await this.rpcProvider.getNetwork();
    const payload: ImGetFeeOptionsRequest = {
      method: 'im_getFeeOptions',
      params: [{
        userAddress,
        data,
        chainId: this.getEip155ChainId(Number(chainId)),
      }],
    };
    const { result } = await this.postToRelayer<ImGetFeeOptionsResponse>(payload);
    return result;
  }

  public async imSignTypedData(address: string, eip712Payload: TypedDataPayload): Promise<string> {
    const { chainId } = await this.rpcProvider.getNetwork();
    const payload: ImSignTypedDataRequest = {
      method: 'im_signTypedData',
      params: [{
        address,
        eip712Payload,
        chainId: this.getEip155ChainId(Number(chainId)),
      }],
    };
    const { result } = await this.postToRelayer<ImSignTypedDataResponse>(payload);
    return result;
  }

  public async imSign(address: string, message: string): Promise<string> {
    const { chainId } = await this.rpcProvider.getNetwork();
    const payload: ImSignRequest = {
      method: 'im_sign',
      params: [{
        address,
        message,
        chainId: this.getEip155ChainId(Number(chainId)),
      }],
    };
    const { result } = await this.postToRelayer<ImSignResponse>(payload);
    return result;
  }
}

