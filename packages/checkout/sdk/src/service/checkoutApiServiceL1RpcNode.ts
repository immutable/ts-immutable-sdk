import { Environment } from '@imtbl/config';
import axios from 'axios';
import {
  ALCHEMY_PATH,
  CHECKOUT_API_BASE_URL,
  ChainId,
  ENVIRONMENT_L1_CHAIN_MAP,
  TokenInfo,
} from '../types';

export type CheckoutApiServiceL1RpcNodeParams = {
  environment: Environment;
};

export type GetTokenMetadataParams = {
  tokens: string[];
};

export type GetTokenMetadataResponse = {
  decimals: number;
  logo?: any;
  name: string;
  symbol: string;
};

export type GetTokenBalances = {
  walletAddress: string;
};

export type TokenBalancesResult = {
  contractAddress: string;
  tokenBalance: string;
};

export type GetTokenBalancesResponse = {
  address: string;
  tokenBalances: TokenBalancesResult[];
};

export class CheckoutApiServiceL1RpcNode {
  private readonly environment: Environment;

  private readonly chain: ChainId;

  private tokensCache: TokenInfo[] | undefined;

  constructor({ environment }: CheckoutApiServiceL1RpcNodeParams) {
    this.environment = environment;
    this.chain = ENVIRONMENT_L1_CHAIN_MAP[this.environment];
  }

  async getTokenBalances({
    walletAddress,
  }: GetTokenBalances): Promise<GetTokenBalancesResponse> {
    let response;
    try {
      response = await axios.post(
        // @ts-ignore -- this is needed because we do not have a way to get L1 only chains
        `${CHECKOUT_API_BASE_URL[this.environment]}${ALCHEMY_PATH[this.chain]}`,
        {
          id: 1,
          jsonrpc: '2.0',
          method: 'alchemy_getTokenBalances',
          params: [walletAddress, 'erc20'],
        },
      );
    } catch (error: any) {
      throw new Error(
        `Error fetching getTokenBalances for ${walletAddress}: ${error.message}`,
      );
    }

    if (response.status !== 200 || response.data === undefined) {
      throw new Error(
        `Error fetching getTokenBalances for ${walletAddress}: ${response.status} ${response.statusText}`,
      );
    }

    if (response.data.result === undefined) {
      throw new Error(
        'Missing response data in getTokenBalances response for '
          + `${walletAddress}: ${response.status} ${response.statusText}`,
      );
    }

    return response.data.result;
  }

  private async getTokenMetadata(tokenAddress: string): Promise<TokenInfo> {
    let response;
    try {
      response = await axios.post(
        // @ts-ignore -- this is needed because we do not have a way to get L1 only chains
        `${CHECKOUT_API_BASE_URL[this.environment]}${ALCHEMY_PATH[this.chain]}`,
        {
          id: 1,
          jsonrpc: '2.0',
          method: 'alchemy_getTokenMetadata',
          params: [tokenAddress],
        },
      );
    } catch (error: any) {
      throw new Error(
        `Error fetching getTokenMetadata for ${tokenAddress}: ${error.message}`,
      );
    }

    if (response.status !== 200 || response.data === undefined) {
      throw new Error(
        `Error fetching getTokenMetadata for ${tokenAddress}: ${response.status} ${response.statusText}`,
      );
    }

    if (response.data.result === undefined) {
      throw new Error(
        `Missing response data in getTokenMetadata response for
         ${tokenAddress}: ${response.status} ${response.statusText}`,
      );
    }

    const token: GetTokenMetadataResponse = response.data.result;
    return {
      address: tokenAddress,
      decimals: token.decimals,
      name: token.name,
      symbol: token.symbol,
      icon: token.logo,
    };
  }

  async getTokensMetadata({
    tokens,
  }: GetTokenMetadataParams): Promise<TokenInfo[]> {
    const tokenMetadataPromises: Promise<TokenInfo>[] = [];
    const tokenInfo: TokenInfo[] = [];

    if (this.tokensCache) {
      tokens.forEach((tokenAddress) => {
        const token = this.tokensCache?.find(
          (cachedToken) => cachedToken.address === tokenAddress,
        );
        if (token) {
          tokenInfo.push(token);
        } else {
          tokenMetadataPromises.push(this.getTokenMetadata(tokenAddress));
        }
      });
    } else {
      tokens.forEach((tokenAddress) => {
        tokenMetadataPromises.push(this.getTokenMetadata(tokenAddress));
      });
    }

    const tokenMetadata = await Promise.allSettled(tokenMetadataPromises);

    (
      tokenMetadata.filter(
        (token) => token.status === 'fulfilled',
      ) as PromiseFulfilledResult<TokenInfo>[]
    ).forEach((token) => {
      this.tokensCache?.push(token.value);
      tokenInfo.push(token.value);
    });

    return tokenInfo;
  }
}
