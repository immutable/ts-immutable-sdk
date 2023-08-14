import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';

/**
 * Interface representing the parameters for {@link Checkout.buy}
 * @property {Web3Provider} provider - The provider to use for the buy.
 * @property {string} orderId - The order ID.
 */
export interface BuyParams {
  provider: Web3Provider;
  orderId: string;
}

export type BuyItem = (NativeItem | ERC20Item | ERC721Item);

export enum ItemType {
  NATIVE = 'NATIVE',
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
}

type NativeItem = {
  type: ItemType.NATIVE;
  amount: BigNumber;
};

type ERC20Item = {
  type: ItemType.ERC20;
  contractAddress: string;
  amount: BigNumber;
  approvalContractAddress: string,
};

type ERC721Item = {
  type: ItemType.ERC721;
  contractAddress: string;
  amount: BigNumber;
  approvalContractAddress: string,
};

export enum GasTokenType {
  NATIVE = 'NATIVE',
  ERC20 = 'ERC20',
}

type NativeGas = {
  type: GasTokenType.NATIVE,
  limit: BigNumber;
};

type ERC20Gas = {
  type: GasTokenType.ERC20,
  contractAddress: string;
  limit: BigNumber;
};

export type BuyResponse = {
  requirements: BuyItem[],
  gas: NativeGas | ERC20Gas,
};
