import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, Contract, utils } from 'ethers';
import { HttpStatusCode } from 'axios';
import {
  ChainId,
  GetAllBalancesResult,
  GetBalanceResult,
  GetBalancesResult,
  TokenFilterTypes,
  TokenInfo,
} from '../types';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';
import { getNetworkInfo } from '../network';
import { getTokenAllowList } from '../tokens';
import { CheckoutConfiguration, getL1ChainId } from '../config';
import {
  Blockscout,
  BlockscoutToken,
  BlockscoutTokens,
  BlockscoutTokenType,
} from '../client';
import {
  DEFAULT_TOKEN_DECIMALS, ERC20ABI, NATIVE,
} from '../env';
import { measureAsyncExecution } from '../logger/debugLogger';

export const getBalance = async (
  config: CheckoutConfiguration,
  web3Provider: Web3Provider,
  walletAddress: string,
): Promise<GetBalanceResult> => await withCheckoutError<GetBalanceResult>(
  async () => {
    const networkInfo = await getNetworkInfo(config, web3Provider);

    if (!networkInfo.isSupported) {
      throw new CheckoutError(
        `Chain:${networkInfo.chainId} is not a supported chain`,
        CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR,
        { chainName: networkInfo.name },
      );
    }

    const balance = await web3Provider.getBalance(walletAddress);
    return {
      balance,
      formattedBalance: utils.formatUnits(
        balance,
        networkInfo.nativeCurrency.decimals,
      ),
      token: networkInfo.nativeCurrency,
    };
  },
  { type: CheckoutErrorType.GET_BALANCE_ERROR },
);

export async function getERC20Balance(
  web3Provider: Web3Provider,
  walletAddress: string,
  contractAddress: string,
) {
  return await withCheckoutError<GetBalanceResult>(
    async () => {
      const contract = new Contract(
        contractAddress,
        JSON.stringify(ERC20ABI),
        web3Provider,
      );

      return Promise.all([
        contract.name(),
        contract.symbol(),
        contract.balanceOf(walletAddress),
        contract.decimals(),
      ])
        .then(([name, symbol, balance, decimals]) => {
          const formattedBalance = utils.formatUnits(balance, decimals);
          return {
            balance,
            formattedBalance,
            token: {
              name,
              symbol,
              decimals,
              address: contractAddress,
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

export const getIndexerBalance = async (
  walletAddress: string,
  chainId: ChainId,
  filterTokens: TokenInfo[] | undefined,
): Promise<GetAllBalancesResult> => {
  // Shuffle the mapping of the tokens configuration so it is a hashmap
  // for faster access to tokens config objects.
  const shouldFilter = filterTokens !== undefined;
  const mapFilterTokens = Object.assign(
    {},
    ...((filterTokens ?? []).map((t) => ({ [t.address || NATIVE]: t }))),
  );

  // Get blockscout client for the given chain
  let blockscoutClient = blockscoutClientMap.get(chainId);
  if (!blockscoutClient) {
    blockscoutClient = new Blockscout({ chainId });
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
          err,
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
          err,
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
    if (shouldFilter && !mapFilterTokens[item.token.address]) return;

    const tokenData = item.token || {};

    const balance = BigNumber.from(item.value);

    let decimals = parseInt(tokenData.decimals, 10);
    if (Number.isNaN(decimals)) decimals = DEFAULT_TOKEN_DECIMALS;

    const token = {
      ...tokenData,
      decimals,
    };

    const formattedBalance = utils.formatUnits(item.value, token.decimals);

    balances.push({ balance, formattedBalance, token } as GetBalanceResult);
  });

  return { balances };
};

export const getBalances = async (
  config: CheckoutConfiguration,
  web3Provider: Web3Provider,
  walletAddress: string,
  tokens: TokenInfo[],
): Promise<GetBalancesResult> => {
  const allBalancePromises: Promise<GetBalanceResult>[] = [];
  tokens
    .forEach((token: TokenInfo) => {
      if (!token.address || token.address.toLocaleLowerCase() === NATIVE) {
        allBalancePromises.push(
          getBalance(config, web3Provider, walletAddress),
        );
      } else {
        allBalancePromises.push(
          getERC20Balance(web3Provider, walletAddress, token.address!),
        );
      }
    });

  const balanceResults = await Promise.allSettled(allBalancePromises);
  const balances = (balanceResults.filter(
    (result) => result.status === 'fulfilled',
  ) as PromiseFulfilledResult<GetBalanceResult>[]
  ).map((result) => result.value);

  return { balances };
};

export const getAllBalances = async (
  config: CheckoutConfiguration,
  web3Provider: Web3Provider,
  walletAddress: string,
  chainId?: ChainId,
): Promise<GetAllBalancesResult> => {
  // eslint-disable-next-line no-param-reassign
  chainId ||= await web3Provider.getSigner().getChainId();

  const { tokens } = await getTokenAllowList(
    config,
    {
      type: TokenFilterTypes.ALL,
      chainId,
    },
  );

  // In order to prevent unnecessary RPC calls
  // let's use the Indexer if available for the
  // given chain.
  let flag = false;
  try {
    flag = (await config.remote.getTokensConfig(chainId)).blockscout || flag;
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  if (flag && Blockscout.isChainSupported(chainId)) {
    // This is a hack because the widgets are still using the tokens symbol
    // to drive the conversions. If we remove all the token symbols from e.g. zkevm
    // then we would not have fiat conversions.
    // Please remove this hack once https://immutable.atlassian.net/browse/WT-1710
    // is done.
    const isL1Chain = getL1ChainId(config) === chainId;
    return await measureAsyncExecution<GetAllBalancesResult>(
      config,
      `Time to fetch balances using blockscout for ${chainId}`,
      getIndexerBalance(walletAddress, chainId, isL1Chain ? tokens : undefined),
    );
  }

  // This fallback to use ERC20s calls which is a best effort solution
  // Fails in fetching data from the RCP calls might result in some
  // missing data.
  return await measureAsyncExecution<GetBalancesResult>(
    config,
    `Time to fetch balances using RPC for ${chainId}`,
    getBalances(config, web3Provider, walletAddress, tokens),
  );
};
