import { Web3Provider } from '@ethersproject/providers';
import { Contract, utils } from 'ethers';
import {
  ChainId,
  ERC20ABI,
  GetAllBalancesResult,
  GetBalanceResult,
  TokenFilterTypes,
  TokenInfo,
} from '../types';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';
import { getNetworkInfo } from '../network';
import { getTokenAllowList } from '../tokens';

export const getBalance = async (
  provider: Web3Provider,
  walletAddress: string
): Promise<GetBalanceResult> => {
  return await withCheckoutError<GetBalanceResult>(
    async () => {
      const networkInfo = await getNetworkInfo(provider);

      if (!networkInfo.isSupported) {
        throw new CheckoutError(
          'Unsupported Network',
          CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR
        );
      }

      const balance = await provider.getBalance(walletAddress);
      return {
        balance,
        formattedBalance: utils.formatUnits(
          balance,
          networkInfo.nativeCurrency.decimals
        ),
        token: networkInfo.nativeCurrency,
      };
    },
    { type: CheckoutErrorType.GET_BALANCE_ERROR }
  );
};

export async function getERC20Balance(
  provider: Web3Provider,
  walletAddress: string,
  contractAddress: string
) {
  return await withCheckoutError<GetBalanceResult>(
    async () => {
      const contract = new Contract(
        contractAddress,
        JSON.stringify(ERC20ABI),
        provider
      );
      const name = await contract.name();
      const symbol = await contract.symbol();
      const balance = await contract.balanceOf(walletAddress);
      const decimals = await contract.decimals();
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
    },
    { type: CheckoutErrorType.GET_ERC20_BALANCE_ERROR }
  );
}

export const getAllBalances = async (
  provider: Web3Provider,
  walletAddress: string,
  chainId: ChainId
): Promise<GetAllBalancesResult> => {
  if (!Object.values(ChainId).includes(chainId))
    throw new CheckoutError(
      `ChainId ${chainId} is not supported`,
      CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR
    );
  if (!provider.provider?.request)
    throw new CheckoutError(
      'provider object is missing request function',
      CheckoutErrorType.PROVIDER_REQUEST_MISSING_ERROR
    );

  const tokenList = await getTokenAllowList({
    type: TokenFilterTypes.ALL,
    chainId,
  });
  const allBalancePromises: Promise<GetBalanceResult>[] = [];
  allBalancePromises.push(getBalance(provider, walletAddress));

  tokenList.tokens
    .filter((token) => token.address)
    .forEach((token: TokenInfo) =>
      allBalancePromises.push(
        getERC20Balance(provider, walletAddress, token.address ?? '')
      )
    );

  const balanceResults = await Promise.allSettled(allBalancePromises);
  const getBalanceResults = (
    balanceResults.filter(
      (result) => result.status === 'fulfilled'
    ) as PromiseFulfilledResult<GetBalanceResult>[]
  ).map(
    (fulfilledResult: PromiseFulfilledResult<GetBalanceResult>) =>
      fulfilledResult.value
  ) as GetBalanceResult[];

  return { balances: getBalanceResults };
};
