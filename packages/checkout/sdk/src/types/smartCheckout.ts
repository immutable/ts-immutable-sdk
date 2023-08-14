import { TransactionRequest, Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { TokenInfo } from './tokenInfo';

/**
 * Interface representing the parameters for {@link Checkout.smartCheckout}
 * @property {Web3Provider} provider - The provider to use for smart checkout.
 * @property {ItemRequirement[]} itemRequirements - The item requirements for the transaction.
 * @property {FulfilmentDetails} fulfilmentDetails - The fulfilment details containing either the transaction or the gas amount.
 */
export interface SmartCheckoutParams {
  provider: Web3Provider;
  itemRequirements: ItemRequirement[];
  fulfilmentDetails: FulfilmentDetails;
}

/**
 * Represents the item requirements for a transaction.
 * NativeItem, ERC20Item or ERC721Item {@link Checkout.smartCheckout}.
 */
export type ItemRequirement = NativeItem | ERC20Item | ERC721Item;

/**
 * An enum representing the item types
 * @enum {string}
 * @property {string} NATIVE - If the item is a native token.
 * @property {string} ERC20 - If the item is an ERC20 token.
 * @property {string} ERC721 - If the item is an ERC721 token.
 */
export enum ItemType {
  NATIVE = 'NATIVE',
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
}

/**
 * Represents a native item.
 * @property {ItemType} type - The type indicate this is a native item.
 * @property {BigNumber} amount - The amount of the item.
 */
type NativeItem = {
  type: ItemType.NATIVE;
  amount: BigNumber;
};

/**
 * Represents an ERC20 item.
 * @property {ItemType} type - The type to indicate this is an ERC20 item.
 * @property {string} contractAddress - The contract address of the ERC20.
 * @property {BigNumber} amount - The amount of the item.
 * @property {string} approvalContractAddress - The contract address of the approver.
 */
type ERC20Item = {
  type: ItemType.ERC20;
  contractAddress: string;
  amount: BigNumber;
  approvalContractAddress: string,
};

/**
 * Represents an ERC721 item.
 * @property {ItemType} type - The type to indicate this is an ERC721 item.
 * @property {string} contractAddress - The contract address of the ERC721.
 * @property {string} id - The ID of this ERC721 in the collection.
 * @property {string} approvalContractAddress - The contract address of the approver.
 */
type ERC721Item = {
  type: ItemType.ERC721;
  contractAddress: string;
  id: string;
  approvalContractAddress: string,
};

/**
 * Represents the fulfilment details for a transaction which is either contains details about the fulfilment transaction or the gas amount.
 */
export type FulfilmentDetails = FulfilmentTransaction | GasAmount;

/**
 * An enum representing the fulfilment details types
 * @enum {string}
 * @property {string} TRANSACTION - If the fulfilment details contains a transaction.
 * @property {string} GAS - If the fulfilment details contains the gas amount.
 */
export enum FulfilmentDetailsType {
  TRANSACTION = 'TRANSACTION',
  GAS = 'GAS',
}

/**
 * The fulfilment transaction which contains the transaction to send.
 * @property {FulfilmentDetailsType} type - The type to indicate this is a fulfilment transaction.
 * @property {TransactionRequest} transaction - The transaction to send.
 */
export type FulfilmentTransaction = {
  type: FulfilmentDetailsType.TRANSACTION;
  transaction: TransactionRequest;
};

/**
 * The gas amount which contains the gas token and the gas limit.
 * @property {FulfilmentDetailsType} type - The type to indicate this is a gas amount.
 * @property {GasToken} gasToken - The gas token.
 */
export type GasAmount = {
  type: FulfilmentDetailsType.GAS;
  gasToken: GasToken;
};

/**
 * Represents the gas token which is either a native token or an ERC20 token.
 */
export type GasToken = NativeGas | ERC20Gas;

/**
 * An enum representing the gas token types
 * @enum {string}
 * @property {string} NATIVE - If the gas token is a native token.
 * @property {string} ERC20 - If the gas token is an ERC20 token.
 */
export enum GasTokenType {
  NATIVE = 'NATIVE',
  ERC20 = 'ERC20',
}

/**
 * Represents a native gas token.
 * @property {GasTokenType} type - The type to indicate this is a native gas token.
 * @property {BigNumber} limit - The gas limit.
 */
export type NativeGas = {
  type: GasTokenType.NATIVE,
  limit: BigNumber;
};

/**
 * Represents an ERC20 gas token.
 * @property {GasTokenType} type - The type to indicate this is an ERC20 gas token.
 * @property {string} contractAddress - The contract address of the ERC20.
 * @property {BigNumber} limit - The gas limit.
 */
export type ERC20Gas = {
  type: GasTokenType.ERC20,
  contractAddress: string;
  limit: BigNumber;
};

/**
 * Represents the result of {@link Checkout.smartCheckout}.
 * @property {boolean} sufficient - If the user address has sufficient funds to cover the transaction.
 * @property {TransactionRequirement[]} transactionRequirements - The transaction requirements.
 */
export interface SmartCheckoutResult {
  sufficient: boolean,
  transactionRequirements: TransactionRequirement[],
}

/**
 * Represents the transaction requirement for a transaction.
 * @property {TransactionRequirementType} type - The type of the transaction requirement.
 * @property {boolean} sufficient - If the user address has sufficient funds to cover the transaction.
 * @property {TransactionRequirementItem} required - The required transaction requirement details.
 * @property {TransactionRequirementItem} current - The current transaction requirement details.
 */
export type TransactionRequirement = {
  type: TransactionRequirementType,
  sufficient: boolean;
  required: TransactionRequirementItem,
  current: TransactionRequirementItem,
};

/**
 * Represents the transaction requirement item for a transaction.
 * @property {BigNumber} balance - The balance of the item.
 * @property {string} formattedBalance - The formatted balance of the item.
 * @property {TokenInfo} token - The token info of the item.
 */
export type TransactionRequirementItem = {
  balance: BigNumber;
  formattedBalance: string;
  token: TokenInfo;
};

/**
 * An enum representing the transaction requirement types
 * @enum {string}
 * @property {string} GAS - If the transaction requirement is for gas.
 * @property {string} NATIVE - If the transaction requirement is for a native token.
 * @property {string} ERC20 - If the transaction requirement is for an ERC20 token.
 */
export enum TransactionRequirementType {
  GAS = 'GAS',
  NATIVE = 'NATIVE',
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
}
