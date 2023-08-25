import { Web3Provider } from '@ethersproject/providers';
import { Contract, utils } from 'ethers';
import {
  ChainId,
  ERC20ABI,
  GetAllBalancesResult,
  GetBalanceResult, GetBalancesResult, IMX_ADDRESS_ZKEVM,
  TokenFilterTypes,
  TokenInfo,
} from '../types';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';
import { getNetworkInfo } from '../network';
import { getTokenAllowList } from '../tokens';
import { CheckoutConfiguration } from '../config';

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

/**
 * Get the balances of the wallet for specific tokens.
 * @param config
 * @param web3Provider
 * @param walletAddress
 * @param tokens
 */
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
  const balances = (
    balanceResults.filter(
      (result) => result.status === 'fulfilled',
    ) as PromiseFulfilledResult<GetBalanceResult>[]
  ).map(
    (fulfilledResult: PromiseFulfilledResult<GetBalanceResult>) => fulfilledResult.value,
  ) as GetBalanceResult[];

  return { balances };
};

/**
 * Get the balances of the wallet for all tokens in allow list.
 * @param config
 * @param web3Provider
 * @param walletAddress
 * @param chainId
 */
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

  return await getBalances(config, web3Provider, walletAddress, tokens);
};
