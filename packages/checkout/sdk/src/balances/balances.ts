import { HttpStatusCode } from 'axios';
import { Contract, formatUnits, JsonRpcProvider } from 'ethers';
import {
  ChainId,
  GetAllBalancesResult,
  GetBalanceResult,
  GetBalancesResult,
  WrappedBrowserProvider,
  TokenFilterTypes,
  TokenInfo,
} from '../types';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';
import { getNetworkInfo } from '../network';
import { getERC20TokenInfo, getTokenAllowList } from '../tokens';
import { CheckoutConfiguration } from '../config';
import {
  Blockscout,
  BlockscoutToken,
  BlockscoutTokenData,
  BlockscoutTokens,
  BlockscoutTokenType,
} from '../api/blockscout';
import {
  DEFAULT_TOKEN_DECIMALS, ERC20ABI, NATIVE,
} from '../env';
import { measureAsyncExecution } from '../logger/debugLogger';
import { isMatchingAddress } from '../utils/utils';

export const getBalance = async (
  config: CheckoutConfiguration,
  provider: JsonRpcProvider | WrappedBrowserProvider,
  walletAddress: string,
): Promise<GetBalanceResult> => await withCheckoutError<GetBalanceResult>(
  async () => {
    const networkInfo = await getNetworkInfo(config, provider);

    if (!networkInfo.isSupported) {
      throw new CheckoutError(
        `Chain:${networkInfo.chainId} is not a supported chain`,
        CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR,
        { chainName: networkInfo.name },
      );
    }

    const balance = await provider.getBalance(walletAddress);
    return {
      balance,
      formattedBalance: formatUnits(
        balance,
        networkInfo.nativeCurrency.decimals,
      ),
      token: networkInfo.nativeCurrency,
    };
  },
  { type: CheckoutErrorType.GET_BALANCE_ERROR },
);

export async function getERC20Balance(
  provider: JsonRpcProvider | WrappedBrowserProvider,
  walletAddress: string,
  tokenAddress: string,
) {
  return await withCheckoutError<GetBalanceResult>(
    async () => {
      const contract = new Contract(
        tokenAddress,
        JSON.stringify(ERC20ABI),
        provider,
      );

      return Promise.all([
        getERC20TokenInfo(provider, tokenAddress),
        contract.balanceOf(walletAddress),
      ])
        .then(([tokenInfo, balance]) => {
          const formattedBalance = formatUnits(balance, tokenInfo.decimals);
          return {
            balance,
            formattedBalance,
            token: {
              name: tokenInfo.name,
              symbol: tokenInfo.symbol,
              decimals: tokenInfo.decimals,
              address: tokenAddress,
            },
          } as GetBalanceResult;
        });
    },
    { type: CheckoutErrorType.GET_ERC20_BALANCE_ERROR },
  );
}

// Blockscout client singleton per chain id
const blockscoutClientMap: Map<ChainId, Blockscout> = new Map();

// This function is a utility function that can be used to reset the
// blockscout map and therefore clear all the cache.
export const resetBlockscoutClientMap = () => blockscoutClientMap.clear();

export const getBlockscoutBalance = async (
  config: CheckoutConfiguration,
  walletAddress: string,
  chainId: ChainId,
  filterTokens: TokenInfo[] | undefined,
): Promise<GetAllBalancesResult> => {
  // Shuffle the mapping of the tokens configuration so it is a hashmap
  // for faster access to tokens config objects.
  const shouldFilter = filterTokens !== undefined;
  const mapFilterTokens = Object.assign(
    {},
    ...((filterTokens ?? []).map((t) => ({ [t.address?.toLowerCase() || NATIVE]: t }))),
  );

  // Get blockscout client for the given chain
  let blockscoutClient = blockscoutClientMap.get(chainId);
  if (!blockscoutClient) {
    const httpClient = config.remote.getHttpClient();
    blockscoutClient = new Blockscout(httpClient, chainId);
    blockscoutClientMap.set(chainId, blockscoutClient);
  }

  // Hold the items in an array for post-fetching processing
  const items: BlockscoutToken[] = [];

  const tokenType = BlockscoutTokenType.ERC20;

  const erc20Balances = async (client: Blockscout) => {
    // Given that the widgets aren't yet designed to support pagination,
    // fetch all the possible tokens associated to a given wallet address.
    let resp: BlockscoutTokens | undefined;
    try {
      do {
      // eslint-disable-next-line no-await-in-loop
        resp = await client.getTokensByWalletAddress({
          walletAddress,
          tokenType,
          nextPage: resp?.next_page_params,
        });
        items.push(...resp.items);
      } while (resp.next_page_params);
    } catch (err: any) {
      // In case of a 404, the wallet is a new wallet that hasn't been indexed by
      // the Blockscout just yet. This happens when a wallet hasn't had any
      // activity on the chain. In this case, simply ignore the error and return
      // no currencies.
      // In case of a malformed wallet address, Blockscout returns a 422, which
      // means we are safe to assume that a 404 is a missing wallet due to inactivity
      // or simply an incorrect wallet address was provided.
      if (err?.code !== HttpStatusCode.NotFound) {
        throw new CheckoutError(
          err.message || 'InternalServerError | getTokensByWalletAddress',
          CheckoutErrorType.GET_INDEXER_BALANCE_ERROR,
          { error: err },
        );
      }
    }
  };

  const nativeBalances = async (client: Blockscout) => {
    try {
      const respNative = await client.getNativeTokenByWalletAddress({ walletAddress });
      respNative.token.address ||= NATIVE;
      items.push(respNative);
    } catch (err: any) {
      // In case of a 404, the wallet is a new wallet that hasn't been indexed by
      // the Blockscout just yet. This happens when a wallet hasn't had any
      // activity on the chain. In this case, simply ignore the error and return
      // no currencies.
      // In case of a malformed wallet address, Blockscout returns a 422, which
      // means we are safe to assume that a 404 is a missing wallet due to inactivity
      // or simply an incorrect wallet address was provided.
      if (err?.code !== HttpStatusCode.NotFound) {
        throw new CheckoutError(
          err.message || 'InternalServerError | getNativeTokenByWalletAddress',
          CheckoutErrorType.GET_INDEXER_BALANCE_ERROR,
          { error: err },
        );
      }
    }
  };

  // Promise all() rather than allSettled() so that the function can fail fast.
  await Promise.all([
    erc20Balances(blockscoutClient),
    nativeBalances(blockscoutClient),
  ]);

  const balances: GetBalanceResult[] = [];
  items.forEach((item) => {
    const allowlistedToken = mapFilterTokens[item.token.address.toLowerCase()];
    if (shouldFilter && !allowlistedToken) return;

    const tokenData = item.token || {};

    if (item.value == null) return;
    const balance = BigInt(item.value);

    let decimals = parseInt(tokenData.decimals, 10);
    if (Number.isNaN(decimals)) decimals = DEFAULT_TOKEN_DECIMALS;

    const icon = (tokenData as BlockscoutTokenData).icon_url ?? allowlistedToken.icon;

    const token = {
      ...tokenData,
      decimals,
      icon,
    };

    const formattedBalance = formatUnits(item.value, token.decimals);

    balances.push({ balance, formattedBalance, token } as GetBalanceResult);
  });

  return { balances };
};

export const getBalances = async (
  config: CheckoutConfiguration,
  provider: JsonRpcProvider | WrappedBrowserProvider,
  walletAddress: string,
  tokens: TokenInfo[],
): Promise<GetBalancesResult> => {
  const allBalancePromises: Promise<GetBalanceResult>[] = [];
  tokens
    .forEach((token: TokenInfo) => {
      // For some reason isNativeToken always returns undefined.
      // We have spent way too much time figuring out why this is happening.
      // That we have given up -- keep it as it is for now.
      if (!token.address || isMatchingAddress(token.address, NATIVE)) {
        allBalancePromises.push(
          getBalance(config, provider, walletAddress),
        );
      } else {
        allBalancePromises.push(
          getERC20Balance(provider, walletAddress, token.address!),
        );
      }
    });

  const balanceResults = await Promise.allSettled(allBalancePromises);
  const balances = (balanceResults.filter(
    (result) => result.status === 'fulfilled',
  ) as PromiseFulfilledResult<GetBalanceResult>[]
  ).map((result) => {
    const resp = result;
    const { token } = resp.value;
    // For some reason isNativeToken always returns undefined.
    // We have spent way too much time figuring out why this is happening.
    // That we have given up -- keep it as it is for now.
    if (!token.address || isMatchingAddress(token.address, NATIVE)) resp.value.token.address = NATIVE;
    return resp.value;
  });

  return { balances };
};

const getTokenBalances = async (
  config: CheckoutConfiguration,
  provider: JsonRpcProvider | WrappedBrowserProvider | undefined,
  walletAddress: string | undefined,
  chainId: ChainId,
  filterTokens: TokenInfo[],
): Promise<GetAllBalancesResult> => {
  if (!provider) {
    throw new CheckoutError(
      'indexer is disabled for this chain, you must provide a provider.',
      CheckoutErrorType.MISSING_PARAMS,
    );
  }

  // This fallback to use ERC20s calls which is a best effort solution
  // Fails in fetching data from the RCP calls might result in some
  // missing data.
  let address = walletAddress;
  if (!address) address = await (await provider.getSigner()).getAddress();
  return await measureAsyncExecution<GetBalancesResult>(
    config,
    `Time to fetch balances using RPC for ${chainId}`,
    getBalances(config, provider, address, filterTokens),
  );
};

export const getAllBalances = async (
  config: CheckoutConfiguration,
  provider: JsonRpcProvider | WrappedBrowserProvider | undefined,
  walletAddress: string | undefined,
  chainId: ChainId,
  forceFetch: boolean = false,
): Promise<GetAllBalancesResult> => {
  if (!walletAddress && !provider) {
    throw new CheckoutError(
      'both walletAddress and provider are missing. At least one must be provided.',
      CheckoutErrorType.MISSING_PARAMS,
    );
  }

  if (!config.networkMap.get(chainId)) {
    throw new CheckoutError(
      `chain ID ${chainId} not supported by the environment`,
      CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR,
    );
  }

  const { tokens } = await getTokenAllowList(
    config,
    {
      type: TokenFilterTypes.ALL,
      chainId,
    },
  );

  if (forceFetch) {
    resetBlockscoutClientMap();
  }

  if (Blockscout.isChainSupported(chainId)) {
    const address = walletAddress ?? await (await provider?.getSigner())?.getAddress();

    try {
      return await measureAsyncExecution<GetAllBalancesResult>(
        config,
        `Time to fetch balances using blockscout for ${chainId}`,
        getBlockscoutBalance(config, address!, chainId, tokens),
      );
    } catch (error) {
      // Blockscout rate limiting, fallback to RPC node
      if ((error as CheckoutError).type === CheckoutErrorType.GET_INDEXER_BALANCE_ERROR
        && (error as CheckoutError).data?.error?.code === HttpStatusCode.TooManyRequests) {
        return getTokenBalances(config, provider, walletAddress, chainId, tokens);
      }
      throw error;
    }
  }

  // Blockscout not supported, fallback to RPC node
  return getTokenBalances(config, provider, walletAddress, chainId, tokens);
};
