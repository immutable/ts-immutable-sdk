import { Environment } from '@imtbl/config';
import axios from 'axios';
import {
  ALCHEMY_PATH,
  ChainId,
  CHECKOUT_API_BASE_URL,
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

  private async getERC20TokenBalances({
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
        `Error fetching getERC20TokenBalances for ${walletAddress}: ${error.message}`,
      );
    }

    console.log(response);

    if (response.status !== 200 || response.data === undefined) {
      throw new Error(
        `Error fetching getERC20TokenBalances for ${walletAddress}: ${response.status} ${response.statusText}`,
      );
    }

    if (response.data.result === undefined) {
      throw new Error(
        'Missing response data in getERC20TokenBalances response for '
          + `${walletAddress}: ${response.status} ${response.statusText}`,
      );
    }

    return response.data.result;
  }

  private async getNativeTokenBalance({
    walletAddress,
  }: GetTokenBalances): Promise<string> {
    let response;
    try {
      response = await axios.post(
        // @ts-ignore -- this is needed because we do not have a way to get L1 only chains
        `${CHECKOUT_API_BASE_URL[this.environment]}${ALCHEMY_PATH[this.chain]}`,
        {
          id: 1,
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [walletAddress, 'latest'],
        },
      );
    } catch (error: any) {
      throw new Error(
        `Error fetching native token balance for ${walletAddress}: ${error.message}`,
      );
    }

    if (response.status !== 200 || response.data === undefined) {
      throw new Error(
        `Error fetching native token balance for ${walletAddress}: ${response.status} ${response.statusText}`,
      );
    }

    if (response.data.result === undefined) {
      throw new Error(
        'Missing response data in getNativeTokenBalance response for '
          + `${walletAddress}: ${response.status} ${response.statusText}`,
      );
    }

    return response.data.result;
  }

  async getTokenBalances({
    walletAddress,
  }: GetTokenBalances): Promise<GetTokenBalancesResponse> {
    const erc20Balances = await this.getERC20TokenBalances({ walletAddress });
    const nativeTokenBalance = await this.getNativeTokenBalance({
      walletAddress,
    });
    erc20Balances.tokenBalances.push({
      contractAddress: '',
      tokenBalance: nativeTokenBalance,
    });

    return erc20Balances;
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
