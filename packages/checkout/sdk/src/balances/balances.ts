import { Web3Provider } from '@ethersproject/providers';
import { BigNumber, Contract, utils } from 'ethers';
import {
  ChainId,
  ERC20ABI,
  GetAllBalancesResult,
  GetBalanceResult,
  GetBalancesResult,
  IMX_ADDRESS_ZKEVM,
  TokenFilterTypes,
  TokenInfo,
} from '../types';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';
import { getNetworkInfo } from '../network';
import { getTokenAllowList } from '../tokens';
import { CheckoutConfiguration } from '../config';
import {
  Blockscout,
  BlockscoutTokens,
  BlockscoutTokenType,
} from '../client';

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

// Blockscout client singleton
let blockscoutClient: Blockscout;

export const getIndexerBalance = async (
  walletAddress: string,
  chainId: ChainId,
  rename: TokenInfo[],
): Promise<GetAllBalancesResult> => {
  // Shuffle the mapping of the tokens configuration so it is a hashmap
  // for faster access to tokens config objects.
  const mapRename = Object.assign({}, ...(rename.map((t) => ({ [t.address || '']: t }))));

  // Ensure singleton is present and match the selected chain
  if (!blockscoutClient || blockscoutClient.chainId !== chainId) blockscoutClient = new Blockscout({ chainId });

  // Hold the items in an array for post-fetching processing
  const items = [];

  const tokenType = BlockscoutTokenType.ERC20;
  // Given that the widgets aren't yet designed to support pagination,
  // fetch all the possible tokens associated to a given wallet address.
  let resp: BlockscoutTokens | undefined;
  try {
    do {
      // eslint-disable-next-line no-await-in-loop
      resp = await blockscoutClient.getTokensByWalletAddress({
        walletAddress,
        tokenType,
        nextPage: resp?.next_page_params,
      });
      items.push(...resp.items);
    } while (resp.next_page_params);
  } catch (err: any) {
    throw new CheckoutError(
      err.message || 'InternalServerError | getTokensByWalletAddress',
      CheckoutErrorType.GET_INDEXER_BALANCE_ERROR,
      err,
    );
  }

  try {
    const respNative = await blockscoutClient.getNativeTokenByWalletAddress({ walletAddress });
    items.push(respNative);
  } catch (err: any) {
    throw new CheckoutError(
      err.message || 'InternalServerError | getNativeTokenByWalletAddress',
      CheckoutErrorType.GET_INDEXER_BALANCE_ERROR,
      err,
    );
  }

  return {
    balances: items.map((item) => {
      const tokenData = item.token || {};

      const balance = BigNumber.from(item.value);

      const renamed = (mapRename[tokenData.address] || {}) as TokenInfo;
      const token = {
        ...tokenData,
        name: renamed.name ?? tokenData.name,
        symbol: renamed.symbol ?? tokenData.symbol,
        decimals: parseInt(tokenData.decimals, 10),
      };

      const formattedBalance = utils.formatUnits(item.value, token.decimals);

      return { balance, formattedBalance, token } as GetBalanceResult;
    }),
  };
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
      // Check for NATIVE token
      if (!token.address || token.address === IMX_ADDRESS_ZKEVM) {
        allBalancePromises.push(
          getBalance(config, web3Provider, walletAddress),
        );
      } else {
        allBalancePromises.push(
          getERC20Balance(web3Provider, walletAddress, token.address),
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
  chainId: ChainId,
): Promise<GetAllBalancesResult> => {
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
    return await getIndexerBalance(walletAddress, chainId, tokens);
  }

  // This fallback to use ERC20s calls which is a best effort solution
  // Fails in fetching data form the RCP calls might result in some
  // missing data.
  return await getBalances(config, web3Provider, walletAddress, tokens);
};
