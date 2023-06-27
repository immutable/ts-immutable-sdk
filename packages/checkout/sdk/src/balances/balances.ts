import { Web3Provider } from '@ethersproject/providers';
import {
  Contract,
  utils,
} from 'ethers';
import {
  ChainId,
  ENVIRONMENT_L1_CHAIN_MAP,
  ENVIRONMENT_L2_CHAIN_MAP,
  ERC20ABI,
  GetAllBalancesResult,
  GetBalanceResult,
} from '../types';
import { CheckoutError, CheckoutErrorType, withCheckoutError } from '../errors';
import { getNetworkInfo } from '../network';
import { CheckoutConfiguration } from '../config';
import { CheckoutApiService } from '../service/checkoutApiService';

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

async function getL1Balances(
  config: CheckoutConfiguration,
  checkoutApiService: CheckoutApiService,
  web3Provider: Web3Provider,
  walletAddress: string,
): Promise<GetBalanceResult[]> {
  const balanceResult: GetBalanceResult[] = [];

  const tokenList = await checkoutApiService.getL1RpcNode().getTokenBalances({ walletAddress });
  const { tokenBalances } = tokenList;

  // Construct array of promises to get all the balances for the current wallet
  // using the standard ERC20 ABI. Although we already have the balance in the
  // tokenBalances; let's use the getERC20Balance to get the token info.
  const allBalancePromises = tokenBalances.map((t) => getERC20Balance(web3Provider, walletAddress, t.contractAddress));
  allBalancePromises.push(getBalance(config, web3Provider, walletAddress));

  (await Promise.allSettled(allBalancePromises)).forEach((r) => {
    if (r.status !== 'fulfilled') return;
    balanceResult.push(r.value);
  });

  return balanceResult;
}

async function getL2Balances(
  config: CheckoutConfiguration,
  web3Provider: Web3Provider,
  walletAddress: string,
  chainId: ChainId,
): Promise<GetBalanceResult[]> {
  const balanceResult: GetBalanceResult[] = [];
  const allBalancePromises: Promise<GetBalanceResult>[] = [];
  const cachedTokens = await config.remoteConfigFetcher.getTokens(chainId);

  // Construct array of promises to get all the balances for the current wallet
  // using the standard ERC20 ABI. Although we already have the balance in the
  // tokenBalances; let's use the getERC20Balance to get the token info.
  cachedTokens.forEach((t) => {
    if (t.address === undefined) return;
    allBalancePromises.push(getERC20Balance(web3Provider, walletAddress, t.address));
  });

  // Ensure we are getting the native token
  allBalancePromises.push(getBalance(config, web3Provider, walletAddress));

  (await Promise.allSettled(allBalancePromises)).forEach((r) => {
    if (r.status !== 'fulfilled') return;
    balanceResult.push(r.value);
  });

  return balanceResult;
}

export const getAllBalances = async (
  config: CheckoutConfiguration,
  checkoutApiService: CheckoutApiService,
  web3Provider: Web3Provider,
  walletAddress: string,
): Promise<GetAllBalancesResult> => {
  const { chainId } = await web3Provider.getNetwork();

  if (chainId === ENVIRONMENT_L1_CHAIN_MAP[config.environment]) {
    const balances = await getL1Balances(
      config,
      checkoutApiService,
      web3Provider,
      walletAddress,
    );
    return { balances };
  }

  if (chainId === ENVIRONMENT_L2_CHAIN_MAP[config.environment]) {
    const balances = await getL2Balances(
      config,
      web3Provider,
      walletAddress,
      chainId,
    );
    return { balances };
  }

  throw new CheckoutError(
    `Chain:${chainId} is not a supported chain`,
    CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR,
  );
};
