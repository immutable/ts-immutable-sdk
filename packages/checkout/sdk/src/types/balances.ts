import { BigNumber } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { TokenInfo } from './tokenInfo';

/**
 * Interface representing the parameters for {@link Checkout.getBalance}.
 * @property {Web3Provider} provider - The provider used to connect to the network.
 * @property {string} walletAddress - The wallet address.
 * @property {string | undefined} contractAddress - The contract address of the token.
 */
export interface GetBalanceParams {
  provider: Web3Provider;
  walletAddress: string;
  contractAddress?: string;
}

/**
 * Interface representing the result of {@link Checkout.getBalance}.
 * @property {BigNumber} balance - The balance of the wallet for the token.
 * @property {string} formattedBalance - The formatted balance of the wallet for the token.
 * @property {TokenInfo} token - The token information.
 */
export interface GetBalanceResult {
  balance: BigNumber;
  formattedBalance: string;
  token: TokenInfo;
}

/**
 * Interface representing the parameters for {@link Checkout.getAllBalances}.
 * @property {Web3Provider} provider - The provider used to connect to the network.
 * @property {string} walletAddress - The wallet address.
 */
export interface GetAllBalancesParams {
  provider: Web3Provider;
  walletAddress?: string;
}

/**
 * Interface representing the result of {@link Checkout.getAllBalances}.
 * @property {GetBalanceResult[]} balances - The array of balances of the wallet for every token.
 */
export interface GetAllBalancesResult {
  balances: GetBalanceResult[];
}

export const ERC20ABI = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    type: 'function',
  },
];
