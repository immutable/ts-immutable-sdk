import { AxiosResponse } from 'axios';
import {
  ChainId,
  ChainSlug,
  ChainTokensConfig,
  ImxAddressConfig,
  TokenBridgeInfo,
} from '../types';
import { HttpClient } from '../api/http';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { RemoteConfigFetcher } from './remoteConfigFetcher';

const INDEXER_ETH_ROOT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000eee';

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
  bridge_used: string | null;
};

type TokensEndpointResponse = {
  result: TokensEndpointResult[];
};

export type RemoteConfigParams = {
  baseUrl: string;
  chainSlug: ChainSlug;
};

export class TokensFetcher {
  private httpClient: HttpClient;

  private remoteConfig: RemoteConfigFetcher;

  private readonly baseUrl: string;

  private readonly chainSlug: ChainSlug;

  private tokensCache: ChainTokensConfig | undefined;

  constructor(
    httpClient: HttpClient,
    remoteConfig: RemoteConfigFetcher,
    params: RemoteConfigParams,
  ) {
    this.baseUrl = params.baseUrl;
    this.chainSlug = params.chainSlug;
    this.httpClient = httpClient;
    this.remoteConfig = remoteConfig;
  }

  private async loadTokens(): Promise<ChainTokensConfig | undefined> {
    if (this.tokensCache) {
      return this.tokensCache;
    }

    let response: AxiosResponse;
    try {
      response = await this.httpClient.get(
        `${this.baseUrl}/v1/chains/${this.chainSlug}/tokens?verification_status=verified&is_canonical=true`,
      );
    } catch (err: any) {
      throw new CheckoutError(
        `Error: ${err.message}`,
        CheckoutErrorType.API_ERROR,
        { error: err },
      );
    }

    const responseData = this.parseResponse(response);

    this.tokensCache = await this.getMappingsForTokensResponse(
      responseData?.result || [],
    );

    return this.tokensCache;
  }

  public async getChainTokensConfig(): Promise<ChainTokensConfig> {
    const config = await this.loadTokens();
    return config ?? {};
  }

  public async getTokensConfig(chainId: ChainId): Promise<TokenBridgeInfo[]> {
    const config = await this.loadTokens();
    if (!config || !config[chainId]) return [];

    return config[chainId] ?? [];
  }

  private async getMappingsForTokensResponse(
    tokenList: TokensEndpointResult[],
  ): Promise<ChainTokensConfig> {
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
        bridge: 'native',
      });
    });

    tokenList.forEach((token) => {
      const chainId = parseInt(
        token.chain.id.split('eip155:').pop() || '',
        10,
      ) as ChainId;

      if (!token.symbol || !token.decimals) {
        return;
      }

      if (!tokens[chainId]) {
        tokens[chainId] = [];
      }

      const tokenInfo: TokenBridgeInfo = {
        address: token.contract_address.toLowerCase(),
        decimals: token.decimals,
        name: token.name,
        symbol: token.symbol,
        icon: token.image_url ?? undefined,
        bridge: token.bridge_used ?? null,
      };

      tokens[chainId]?.push(tokenInfo);

      const rootChainId = parseInt(
        token.root_chain_id?.split('eip155:').pop() || '',
        10,
      ) as ChainId;
      let address = token.root_contract_address?.toLowerCase();

      if (rootChainId && address) {
        if (!tokens[rootChainId]) {
          tokens[rootChainId] = [];
        }

        if (address === INDEXER_ETH_ROOT_CONTRACT_ADDRESS) {
          address = 'native';
        }

        tokens[rootChainId]?.push({
          ...tokenInfo,
          address,
        });
      }
    });

    return tokens;
  }

  // eslint-disable-next-line class-methods-use-this
  private parseResponse(
    response: AxiosResponse<any, any>,
  ): TokensEndpointResponse | undefined {
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
    return await this.remoteConfig.getConfig(
      'imxAddressMapping',
    ) as ImxAddressConfig;
  }
}
