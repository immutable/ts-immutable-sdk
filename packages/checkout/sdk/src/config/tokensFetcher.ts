import { Environment } from '@imtbl/config';
import { AxiosResponse } from 'axios';
import {
  ChainId, ChainSlug, ChainTokensConfig, ImxAddressConfig, TokenInfo,
} from '../types';
import { ENV_DEVELOPMENT, IMMUTABLE_API_BASE_URL } from '../env';
import { HttpClient } from '../api/http';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { RemoteConfigFetcher } from './remoteConfigFetcher';

type TokensEndpointResult = {
  chain: {
    id: string;
    name: string;
  };
  contract_address: string;
  decimals: number;
  image_url: string | null;
  is_canonical: boolean;
  name: string;
  symbol: string;
  root_chain_id: string | null;
  root_contract_address: string | null;
};

type TokensEndpointResponse = {
  result: TokensEndpointResult[];
};

export type RemoteConfigParams = {
  isDevelopment: boolean;
  isProduction: boolean;
};

export class TokensFetcher {
  private httpClient: HttpClient;

  private remoteConfig: RemoteConfigFetcher;

  private readonly isDevelopment: boolean;

  private readonly isProduction: boolean;

  private tokensCache: ChainTokensConfig | undefined;

  constructor(httpClient: HttpClient, remoteConfig: RemoteConfigFetcher, params: RemoteConfigParams) {
    this.isDevelopment = params.isDevelopment;
    this.isProduction = params.isProduction;
    this.httpClient = httpClient;
    this.remoteConfig = remoteConfig;
  }

  private getBaseUrl = () => {
    if (this.isDevelopment) return IMMUTABLE_API_BASE_URL[ENV_DEVELOPMENT];
    if (this.isProduction) return IMMUTABLE_API_BASE_URL[Environment.PRODUCTION];
    return IMMUTABLE_API_BASE_URL[Environment.SANDBOX];
  };

  private getChainSlug = () => {
    if (this.isDevelopment) return ChainSlug.IMTBL_ZKEVM_DEVNET;
    if (this.isProduction) return ChainSlug.IMTBL_ZKEVM_MAINNET;
    return ChainSlug.IMTBL_ZKEVM_TESTNET;
  };

  private async loadTokens(): Promise<ChainTokensConfig | undefined> {
    if (this.tokensCache) {
      return this.tokensCache;
    }

    let response: AxiosResponse;
    try {
      response = await this.httpClient.get(
        `${this.getBaseUrl()}/v1/chains/${this.getChainSlug()}/tokens?verification_status=verified&is_canonical=true`,
      );
    } catch (err: any) {
      throw new CheckoutError(
        `Error: ${err.message}`,
        CheckoutErrorType.API_ERROR,
        { error: err },
      );
    }

    const responseData = this.parseResponse(response);

    this.tokensCache = await this.getMappingsForTokensResponse(responseData?.result || []);

    return this.tokensCache;
  }

  public async getTokensConfig(chainId: ChainId): Promise<TokenInfo[]> {
    const config = await this.loadTokens();
    if (!config || !config[chainId]) return [];

    return config[chainId] ?? [];
  }

  private async getMappingsForTokensResponse(tokenList: TokensEndpointResult[]): Promise<ChainTokensConfig> {
    const tokens: ChainTokensConfig = {};

    const imxMappings = await this.fetchIMXTokenMappings();

    Object.keys(imxMappings).forEach((chain) => {
      const chainId = parseInt(chain, 10) as ChainId;
      tokens[chainId] = [];

      tokens[chainId]?.push({
        address: imxMappings[chain],
        decimals: 18,
        name: 'IMX',
        symbol: 'IMX',
      });
    });

    tokenList.forEach((token) => {
      const chainId = parseInt(token.chain.id.split('eip155:').pop() || '', 10) as ChainId;

      if (!token.symbol || !token.decimals) {
        return;
      }

      if (!tokens[chainId]) {
        tokens[chainId] = [];
      }

      const tokenInfo: TokenInfo = {
        address: token.contract_address.toLowerCase(),
        decimals: token.decimals,
        name: token.name,
        symbol: token.symbol,
        icon: token.image_url ?? undefined,
      };

      tokens[chainId]?.push(tokenInfo);

      const rootChainId = parseInt(token.root_chain_id?.split('eip155:').pop() || '', 10) as ChainId;
      if (rootChainId && token.root_contract_address) {
        if (!tokens[rootChainId]) {
          tokens[rootChainId] = [];
        }

        tokens[rootChainId]?.push({
          ...tokenInfo,
          address: token.root_contract_address,
        });
      }
    });

    return tokens;
  }

  // eslint-disable-next-line class-methods-use-this
  private parseResponse(response: AxiosResponse<any, any>): TokensEndpointResponse | undefined {
    let responseData: TokensEndpointResponse = response.data;
    if (response.data && typeof response.data !== 'object') {
      try {
        responseData = JSON.parse(response.data);
      } catch (err: any) {
        throw new CheckoutError(
          'Invalid token data',
          CheckoutErrorType.API_ERROR,
          { error: err },
        );
      }
    }

    return responseData;
  }

  private async fetchIMXTokenMappings() {
    return (await this.remoteConfig.getConfig(
      'imxAddressMapping',
    )) as ImxAddressConfig;
  }
}
