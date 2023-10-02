import { TransactionRequest, Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { TokenInfo } from './tokenInfo';

export type ActionResult = {
  status: SuccessStatus | FailedStatus | InsufficientFundsStatus,
  smartCheckoutResult: Array<SmartCheckoutSufficient | SmartCheckoutInsufficient>
};

export enum ActionStatusType {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
}

type SuccessStatus = {
  type: ActionStatusType.SUCCESS,
  order: Order[],
};

type FailedStatus = {
  type: ActionStatusType.FAILED,
  transactionHash: string,
  reason: string,
  order: Order[]
};

type InsufficientFundsStatus = {
  type: ActionStatusType.INSUFFICIENT_FUNDS,
  order: Order[]
};

type Order = BuyOrder | SellOrder | CancelOrder;

export enum OrderType {
  BUY = 'BUY',
  SELL = 'SELL',
  CANCEL = 'CANCEL',
}

type BuyOrder = {
  type: OrderType.BUY,
  id: string,
  takerFees?:[{
    amount: { token: string } | { percent: number },
    recipient: string,
  }]
};

type SellOrder = {
  type: OrderType.SELL,
  id: string,
  sellToken: SellToken,
  buyToken: BuyToken,
  makerFees?: [{
    amount: { token: string } | { percent: number },
    recipient: string,
  }]
};

type BuyToken = {
  type: ItemType.NATIVE | ItemType.ERC20;
  amount: '1.05';
  contractAddress: '0x2222';
};

type SellToken = {
  id: string,
  collectionAddress: string
};

type CancelOrder = {
  type: OrderType.CANCEL,
  id: string
};

/**
 * Interface representing the parameters for {@link Checkout.smartCheckout}
 * @property {Web3Provider} provider - The provider to use for smart checkout.
 * @property {ItemRequirement[]} itemRequirements - The item requirements for the transaction.
 * @property {FulfillmentTransaction | GasAmount} transactionOrGasAmount - The transaction or gas amount.
 */
export interface SmartCheckoutParams {
  provider: Web3Provider;
  itemRequirements: (NativeItemRequirement | ERC20ItemRequirement | ERC721ItemRequirement)[];
  transactionOrGasAmount: FulfillmentTransaction | GasAmount,
}

export type NativeItemRequirement = {
  type: ItemType.NATIVE;
  amount: string;
};

export type ERC20ItemRequirement = {
  type: ItemType.ERC20;
  contractAddress: string;
  amount: string;
  spenderAddress: string,
};

export type ERC721ItemRequirement = {
  type: ItemType.ERC721;
  contractAddress: string;
  id: string;
  spenderAddress: string,
};

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
export type NativeItem = {
  type: ItemType.NATIVE;
  amount: BigNumber;
};

/**
 * Represents an ERC20 item.
 * @property {ItemType} type - The type to indicate this is an ERC20 item.
 * @property {string} contractAddress - The contract address of the ERC20.
 * @property {BigNumber} amount - The amount of the item.
 * @property {string} spenderAddress - The contract address of the approver.
 */
export type ERC20Item = {
  type: ItemType.ERC20;
  contractAddress: string;
  amount: BigNumber;
  spenderAddress: string,
};

/**
 * Represents an ERC721 item.
 * @property {ItemType} type - The type to indicate this is an ERC721 item.
 * @property {string} contractAddress - The contract address of the ERC721.
 * @property {string} id - The ID of this ERC721 in the collection.
 * @property {string} spenderAddress - The contract address of the approver.
 */
export type ERC721Item = {
  type: ItemType.ERC721;
  contractAddress: string;
  id: string;
  spenderAddress: string,
};

/**
 * An enum representing transaction or gas types
 * @enum {string}
 * @property {string} TRANSACTION - If the type is a transaction
 * @property {string} GAS - If the type is the gas amount
 */
export enum TransactionOrGasType {
  TRANSACTION = 'TRANSACTION',
  GAS = 'GAS',
}

/**
 * The fulfillment transaction which contains the transaction to send.
 * @property {TransactionOrGasType} type - The type to indicate this is a fulfillment transaction.
 * @property {TransactionRequest} transaction - The transaction to send.
 */
export type FulfillmentTransaction = {
  type: TransactionOrGasType.TRANSACTION;
  transaction: TransactionRequest;
};

/**
 * The gas amount which contains the gas token and the gas limit.
 * @property {TransactionOrGasType} type - The type to indicate this is a gas amount.
 * @property {GasToken} gasToken - The gas token.
 */
export type GasAmount = {
  type: TransactionOrGasType.GAS;
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
 * The type representing the result of {@link Checkout.smartCheckout}.
 */
export type SmartCheckoutResult = SmartCheckoutSufficient | SmartCheckoutInsufficient;

/**
 * Represents the result of {@link Checkout.smartCheckout} when smart checkout is sufficient.
 * @property {boolean} sufficient - Indicates that smart checkout determined the user had sufficient funds.
 * @property {TransactionRequirement[]} transactionRequirements - The transaction requirements smart checkout
 * determined were required for the transaction.
 */
export type SmartCheckoutSufficient = {
  sufficient: true,
  transactionRequirements: TransactionRequirement[],
};

/**
 * Represents the result of {@link Checkout.smartCheckout} when smart checkout is insufficient.
 * @property {boolean} sufficient - Indicates that smart checkout determined the user has insufficient funds
 * @property {TransactionRequirement[]} transactionRequirements - The transaction requirements smart checkout
 * determined were required for the transaction.
 * @property {SmartCheckoutRouter} router - The type containing the funding routes the user can take to fulfill the transaction requirements
 */
export type SmartCheckoutInsufficient = {
  sufficient: false,
  transactionRequirements: TransactionRequirement[],
  router: SmartCheckoutRouter
};

/**
 * Represents the routing outcome for a transaction.
 * @property {boolean} isPassport - Indicates if the provider used was a passport provider.
 * @property {AvailableRoutingOptions} availableRoutingOptions - The routing options available to the user
 * @property {RoutingOutcome} routingOutcome - The routing outcome for the transaction which
 * includes the funding routes if routes were found
 */
export type SmartCheckoutRouter = {
  isPassport: boolean,
  availableRoutingOptions: AvailableRoutingOptions,
  routingOutcome: RoutingOutcome
};

/**
 * An enum representing the routing outcome types
 * @enum {string}
 * @property {string} ROUTES_FOUND - If funding routes were found for the transaction.
 * @property {string} NO_ROUTES_FOUND - If no funding routes were found for the transaction.
 * @property {string} NO_ROUTE_OPTIONS - If no routing options were available for the transaction.
 */
export enum RoutingOutcomeType {
  ROUTES_FOUND = 'ROUTES_FOUND',
  NO_ROUTES_FOUND = 'NO_ROUTES_FOUND',
  NO_ROUTE_OPTIONS = 'NO_ROUTE_OPTIONS',
}

/*
* The type representing the routing outcome for a transaction.
*/
export type RoutingOutcome = RoutesFound | NoRoutesFound | NoRouteOptions;

/**
* Represents the routing outcome for a transaction.
* @property {RoutingOutcomeType.ROUTES_FOUND} type - Indicates that funding routes were found for the transaction.
* @property {AvailableRoutingOptions} fundingRoutes - The funding routes found for the transaction.
*/
export type RoutesFound = {
  type: RoutingOutcomeType.ROUTES_FOUND,
  fundingRoutes: FundingRoute[]
};

/**
 * Represents a funding route
 * @property {number} priority - The priority of the route
 * @property {FundingStep[]} steps - The steps associated with this funding route
 * @property {TotalFees | undefined} totalFees - The total fees for this route
 */
export type FundingRoute = {
  priority: number;
  steps: FundingStep[]
  totalFees?: TotalFees,
};

/*
* Type representing the various funding steps
*/
export type FundingStep = BridgeFundingStep | SwapFundingStep | OnRampFundingStep;

/**
 * Represents a bridge funding route
 * @property {FundingStepType.BRIDGE} type - Indicates that this is a bridge funding step
 * @property {number} chainId - The chain id this funding step should be executed on
 * @property {FundingItem} fundingItem - The funding item for this step
 * @property {BridgeFees} fees - The aggregated fees for this step
 */
export type BridgeFundingStep = {
  type: FundingStepType.BRIDGE,
  chainId: number,
  fundingItem: FundingItem,
  fees: {
    approvalGasFees: Fee,
    bridgeGasFees: Fee,
    bridgeFees: Fee[],
  },
};

/**
 * Represents the aggregated fees for a funding step
 * @property {Fee} gas - The total gas fees for this funding step
 * @property {Fee} other - The total of all other fees associated with this funding step
 * @property {Fee} total - The total combined gas and other fees for this funding step
 */
export type TotalFees = {
  gas: Fee,
  other: Fee,
  total: Fee,
};

/**
 * Represents a fee
 * @property {BigNumber} amount - The amount of the fee
 * @property {string} formatted - The formatted amount of the fee
 */
export type Fee = {
  amount: BigNumber;
  formattedAmount: string;
};

export type SwapFundingStep = {
  type: FundingStepType.SWAP,
  chainId: number,
  fundingItem: FundingItem,
  fees: {
    approvalGasFees: Fee,
    swapGasFees: Fee,
    swapFees: Fee[],
  },
};

export type OnRampFundingStep = {
  type: FundingStepType.ONRAMP,
  chainId: number,
  fundingItem: FundingItem
};

/**
 * An enum representing the funding step types
 * @enum {string}
 * @property {string} BRIDGE - If the funding step is a bridge.
 * @property {string} SWAP - If the funding step is a swap.
 * @property {string} ONRAMP - If the funding step is an onramp.
 */
export enum FundingStepType {
  BRIDGE = 'BRIDGE',
  SWAP = 'SWAP',
  ONRAMP = 'ONRAMP',
}

// Native or ERC20 funding item
export type FundingItem = {
  type: ItemType.NATIVE | ItemType.ERC20,
  fundsRequired: {
    amount: BigNumber,
    formattedAmount: string
  },
  userBalance: {
    balance: BigNumber,
    formattedBalance: string
  },
  token: TokenInfo
};

export type FundingItemFees = {
  type: FundingItemFeeType,
  fee: Fee,
  tokenInfo: TokenInfo,
};

export enum FundingItemFeeType {
  GAS = 'GAS',
  BRIDGE_FEE = 'BRIDGE_FEE',
  SWAP_FEE = 'SWAP_FEE',
  MAKER_FEE = 'MAKER_FEE',
  TAKER_FEE = 'TAKER_FEE',
  ROYALTY = 'ROYALTY',
  OTHER = 'OTHER',
}

type NoRoutesFound = {
  type: RoutingOutcomeType.NO_ROUTES_FOUND,
  message: string
};

type NoRouteOptions = {
  type: RoutingOutcomeType.NO_ROUTE_OPTIONS,
  message: string
};

/**
 * Represents the transaction requirement for a transaction.
 * @property {ItemType} type - The type of the transaction requirement.
 * @property {boolean} sufficient - If the user address has sufficient funds to cover the transaction.
 * @property {TransactionRequirementItem} required - The required item balance.
 * @property {TransactionRequirementItem} current - The current item balance.
 * @property {TransactionRequirementDelta} delta - The delta between the required and current balances.
 */
export type TransactionRequirement = {
  type: ItemType,
  sufficient: boolean;
  required: ItemBalance,
  current: ItemBalance,
  delta: BalanceDelta,
};

/**
 * Represents the balance for either a native or ERC20 token.
 * @property {BigNumber} balance - The balance of the item.
 * @property {string} formattedBalance - The formatted balance of the item.
 * @property {TokenInfo} token - The token info of the item.
 */
export type TokenBalance = {
  type: ItemType.NATIVE | ItemType.ERC20;
  balance: BigNumber;
  formattedBalance: string;
  token: TokenInfo;
};

/**
 * Represents the balance for an ERC20.
 * @property {BigNumber} balance - The balance of the item.
 * @property {string} formattedBalance - The formatted balance of the item.
 * @property {TokenInfo} token - The token info of the item.
 */
export interface ERC721Balance {
  type: ItemType.ERC721,
  balance: BigNumber;
  formattedBalance: string;
  contractAddress: string;
  id: string;
}

/**
 * Type representing the balance of an item.
 */
export type ItemBalance = ERC721Balance | TokenBalance;

/**
 * Represents the delta between two balances.
 * @property {BigNumber} balance - The delta of the balance.
 * @property {string} formattedBalance - The formatted balance of the delta.
 */
export type BalanceDelta = {
  balance: BigNumber;
  formattedBalance: string;
};

/**
 * A type representing the Smart Checkout routing options available for a user
 * if they are configured and enabled (not geo-blocked etc.)
 */
export type AvailableRoutingOptions = {
  onRamp?: boolean;
  swap?: boolean;
  bridge?: boolean;
};

export type FundingRouteBalanceItem = {
  balance: BigNumber,
  formattedBalance: string,
  token: TokenInfo
};

export type FundingRouteFeeEstimate = SwapRouteFeeEstimate | BridgeRouteFeeEstimate;
export type SwapRouteFeeEstimate = {
  type: FundingStepType.SWAP;
  estimatedAmount: BigNumber;
  token: TokenInfo;
};
export type BridgeRouteFeeEstimate = {
  type: FundingStepType.BRIDGE;
  gasFee: {
    estimatedAmount: BigNumber;
    token?: TokenInfo;
  };
  bridgeFee: {
    estimatedAmount: BigNumber;
    token?: TokenInfo;
  };
  totalFees: BigNumber;
};
