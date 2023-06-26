import { Environment } from '@imtbl/config';
import axios from 'axios';
import {
  ALCHEMY_PATH,
  CHECKOUT_API_BASE_URL,
  ChainId,
  ENVIRONMENT_L1_CHAIN_MAP,
} from '../types';

export type CheckoutApiServiceL1RpcNodeParams = {
  environment: Environment;
};

export type GetTokenMetadataParams = {
  token: string;
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

  async getTokenMetadata({
    token,
  }: GetTokenMetadataParams): Promise<GetTokenMetadataResponse> {
    let response;
    try {
      response = await axios.post(
        // @ts-ignore -- this is needed because we do not have a way to get L1 only chains
        `${CHECKOUT_API_BASE_URL[this.environment]}${ALCHEMY_PATH[this.chain]}`,
        {
          id: 1,
          jsonrpc: '2.0',
          method: 'alchemy_getTokenMetadata',
          params: [token],
        },
      );
    } catch (error: any) {
      throw new Error(
        `Error fetching getTokenMetadata for ${token}: ${error.message}`,
      );
    }

    if (response.status !== 200 || response.data === undefined) {
      throw new Error(
        `Error fetching getTokenMetadata for ${token}: ${response.status} ${response.statusText}`,
      );
    }

    if (response.data.result === undefined) {
      throw new Error(
        `Missing response data in getTokenMetadata response for ${token}: ${response.status} ${response.statusText}`,
      );
    }

    return response.data.result;
  }
}
