import { Web3Provider } from '@ethersproject/providers';
import { Contract, utils } from 'ethers';
import {
  ChainId,
  ENVIRONMENT_L1_CHAIN_MAP,
  ERC20ABI,
  GetAllBalancesResult,
  GetBalanceResult,
  TokenInfo,
} from '../types';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';
import { getNetworkInfo } from '../network';
import { CheckoutConfiguration } from '../config';
import { CheckoutApiService } from '../service/checkoutApiService';
import { getAllL2Tokens } from '../tokens';

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
    { type: CheckoutErrorType.GET_ERC20_BALANCE_ERROR },
  );
}

async function getAllL1Tokens(
  checkoutApiService: CheckoutApiService,
  config: CheckoutConfiguration,
  walletAddress: string,
): Promise<TokenInfo[]> {
  const tokenList = await checkoutApiService
    .getL1RpcNode()
    .getTokenBalances({ walletAddress });
  return tokenList.tokenBalances.map(
    (token) => ({
      address: token.contractAddress,
    } as TokenInfo),
  );
}

export const getAllBalances = async (
  config: CheckoutConfiguration,
  checkoutApiService: CheckoutApiService,
  web3Provider: Web3Provider,
  walletAddress: string,
  chainId: ChainId,
): Promise<GetAllBalancesResult> => {
  const tokenList = chainId === ENVIRONMENT_L1_CHAIN_MAP[config.environment]
    ? await getAllL1Tokens(
      // if L1, fetch tokens from checkout api
      checkoutApiService,
      config,
      walletAddress,
    )
    : await getAllL2Tokens(config);

  const allBalancePromises: Promise<GetBalanceResult>[] = [];
  allBalancePromises.push(getBalance(config, web3Provider, walletAddress));

  tokenList
    .filter((token: TokenInfo) => token.address)
    .forEach((token: TokenInfo) => allBalancePromises.push(
      getERC20Balance(web3Provider, walletAddress, token.address ?? ''),
    ));

  const balanceResults = await Promise.allSettled(allBalancePromises);
  const getBalanceResults = (
    balanceResults.filter(
      (result) => result.status === 'fulfilled',
    ) as PromiseFulfilledResult<GetBalanceResult>[]
  ).map(
    (fulfilledResult: PromiseFulfilledResult<GetBalanceResult>) => fulfilledResult.value,
  ) as GetBalanceResult[];

  return { balances: getBalanceResults };
};
