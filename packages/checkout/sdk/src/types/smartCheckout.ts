import { TransactionRequest, Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { TokenInfo } from './tokenInfo';
import { OrderFee } from './fees';

/*
* Type representing the result of the buy
*/
export type BuyResult = BuyResultSuccess | BuyResultFailed | BuyResultInsufficientFunds;

/**
 * Represents the result of {@link Checkout.buy}
 * @property {CheckoutStatus.SUCCESS} status
 * @property {SmartCheckoutSufficient} smartCheckoutResult
 */
export type BuyResultSuccess = {
  /** The status to indicate success */
  status: CheckoutStatus.SUCCESS,
  /** The sufficient result of smart checkout */
  smartCheckoutResult: SmartCheckoutSufficient
};

/**
 * Represents the result of {@link Checkout.buy}
 * @property {CheckoutStatus.FAILED} status
 * @property {string} transactionHash
 * @property {string} reason
 * @property {SmartCheckoutSufficient} smartCheckoutResult
 */
export type BuyResultFailed = {
  /** The status to indicate failure */
  status: CheckoutStatus.FAILED,
  /** The transaction hash of the failed transaction */
  transactionHash: string,
  /** The reason for the failure */
  reason: string,
  /** The sufficient result of smart checkout */
  smartCheckoutResult: SmartCheckoutSufficient
};

/**
 * Represents the result of {@link Checkout.buy}
 * @property {CheckoutStatus.INSUFFICIENT_FUNDS} status
 * @property {SmartCheckoutInsufficient} smartCheckoutResult
 */
export type BuyResultInsufficientFunds = {
  /** The status to indicate insufficient funds */
  status: CheckoutStatus.INSUFFICIENT_FUNDS,
  /** The insufficient result of smart checkout */
  smartCheckoutResult: SmartCheckoutInsufficient
};

/*
* Type representing the result of the sell
*/
export type SellResult = SellResultSuccess | SellResultFailed | SellResultInsufficientFunds;

/**
 * Represents the result of {@link Checkout.sell}
 * @property {CheckoutStatus.SUCCESS} status
 * @property {string[]} orderIds
 * @property {SmartCheckoutSufficient} smartCheckoutResult
 */
export type SellResultSuccess = {
  /** The status to indicate success */
  status: CheckoutStatus.SUCCESS,
  /** The orders' ids */
  orderIds: string[],
  /** The sufficient result of smart checkout */
  smartCheckoutResult: SmartCheckoutSufficient
};

/**
 * Represents the result of {@link Checkout.sell}
 * @property {CheckoutStatus.FAILED} status
 * @property {string} transactionHash
 * @property {string} reason
 * @property {SmartCheckoutSufficient} smartCheckoutResult
 */
export type SellResultFailed = {
  /** The status to indicate failure */
  status: CheckoutStatus.FAILED,
  /** The transaction hash of the failed transaction */
  transactionHash: string,
  /** The reason for the failure */
  reason: string,
  /** The sufficient result of smart checkout */
  smartCheckoutResult: SmartCheckoutSufficient
};

/**
 * Represents the result of {@link Checkout.sell}
 * @property {CheckoutStatus.INSUFFICIENT_FUNDS} status
 * @property {SmartCheckoutInsufficient} smartCheckoutResult
 */
export type SellResultInsufficientFunds = {
  /** The status to indicate insufficient funds */
  status: CheckoutStatus.INSUFFICIENT_FUNDS,
  /** The insufficient result of smart checkout */
  smartCheckoutResult: SmartCheckoutInsufficient
};

/*
* Type representing the result of the cancel
*/
export type CancelResult = CancelResultSuccess | CancelResultFailed;

/**
 * Represents the result of {@link Checkout.cancel}
 * @property {CheckoutStatus.SUCCESS} status
 */
export type CancelResultSuccess = {
  /** The status to indicate success */
  status: CheckoutStatus.SUCCESS,
};

/**
 * Represents the result of {@link Checkout.cancel}
 * @property {CheckoutStatus.FAILED} status
 * @property {string} transactionHash
 * @property {string} reason
 */
export type CancelResultFailed = {
  /** The status to indicate failure */
  status: CheckoutStatus.FAILED,
  /** The transaction hash of the failed transaction */
  transactionHash: string,
  /** The reason for the failure */
  reason: string,
};

/**
 * An enum representing the checkout status types
 * @enum {string}
 * @property {string} SUCCESS - If checkout succeeded as the transactions were able to be processed
 * @property {string} FAILED - If checkout failed due to transactions not settling on chain
 * @property {string} INSUFFICIENT_FUNDS - If checkout failed due to insufficient funds
 */
export enum CheckoutStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
}

/**
 * The type representing the order to buy
 * @property {string} orderId
 * @property {Array<OrderFee>} takerFees
 */
export type BuyOrder = {
  /** the id of the order to buy */
  id: string,
  /** array of order fees to apply to the order */
  takerFees?: OrderFee[],
};

/**
 * The type representing the sell order to create a listing from
 * @property {SellToken} sellToken
 * @property {BuyToken} buyToken
 * @property {OrderFee[]} makerFees
 */
export type SellOrder = {
  /** the token to be listed for sale */
  sellToken: SellToken,
  /** the token info of the price of the item */
  buyToken: BuyToken,
  /** option array of makerFees to be applied to the listing */
  makerFees?: OrderFee[],
};

/**
 * Represents the token that the item can be bought with once listed for sale.
 * NativeBuyToken or ERC20BuyToken {@link Checkout.smartCheckout}.
 */
export type BuyToken = NativeBuyToken | ERC20BuyToken;

/**
 * Represents a native buy token
 * @property {ItemType} type
 * @property {string} amount
 */
export type NativeBuyToken = {
  /** The type indicate this is a native token. */
  type: ItemType.NATIVE;
  /** The amount of native token. */
  amount: string;
};

/**
 * Represents a ERC20 buy token
 * @property {ItemType} type
 * @property {string} amount
 * @property {string} tokenAddress
 */
export type ERC20BuyToken = {
  /** The type indicate this is a ERC20 token. */
  type: ItemType.ERC20;
  /** The amount of native token. */
  amount: string;
  /** The token address of the ERC20. */
  tokenAddress: string;
};

/**
 * The SellToken type
 * @property {string} id
 * @property {string} collectionAddress
 */
export type SellToken = {
  /**  The ERC721 token id */
  id: string,
  /** The ERC721 collection address */
  collectionAddress: string
};

/**
 * Interface representing the parameters for {@link Checkout.smartCheckout}
 * @property {Web3Provider} provider
 * @property {ItemRequirement[]} itemRequirements
 * @property {FulfillmentTransaction | GasAmount} transactionOrGasAmount
 */
export interface SmartCheckoutParams {
  /** The provider to use for smart checkout. */
  provider: Web3Provider;
  /** The item requirements for the transaction. */
  itemRequirements: (NativeItemRequirement | ERC20ItemRequirement | ERC721ItemRequirement)[];
  /** The transaction or gas amount. */
  transactionOrGasAmount: FulfillmentTransaction | GasAmount,
}

/**
 * Represents a native item requirement for a transaction.
 * @property {ItemType.NATIVE} type
 * @property {string} amount
 */
export type NativeItemRequirement = {
  /** The type to indicate this is a native item requirement. */
  type: ItemType.NATIVE;
  /** The amount of the item. */
  amount: string;
};

/**
 * Represents an ERC20 item requirement for a transaction.
 * @property {ItemType.ERC20} type
 * @property {string} tokenAddress
 * @property {string} amount
 * @property {string} spenderAddress
 */
export type ERC20ItemRequirement = {
  /** The type to indicate this is a ERC20 item requirement. */
  type: ItemType.ERC20;
  /** The token address of the ERC20. */
  tokenAddress: string;
  /** The amount of the item. */
  amount: string;
  /** The contract address of the approver. */
  spenderAddress: string,
};

/**
 * Represents an ERC721 item requirement for a transaction.
 * @property {ItemType.ERC721} type
 * @property {string} contractAddress
 * @property {string} id
 * @property {string} spenderAddress
 */
export type ERC721ItemRequirement = {
  /** The type to indicate this is a ERC721 item requirement. */
  type: ItemType.ERC721;
  /** The contract address of the ERC721 collection. */
  contractAddress: string;
  /** The ID of this ERC721 in the collection. */
  id: string;
  /** The contract address of the approver. */
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
 * @property {ItemType} type
 * @property {BigNumber} amount
 */
export type NativeItem = {
  /** The type indicate this is a native item. */
  type: ItemType.NATIVE;
  /** The amount of the item. */
  amount: BigNumber;
};

/**
 * Represents an ERC20 item.
 * @property {ItemType} type
 * @property {string} tokenAddress
 * @property {BigNumber} amount
 * @property {string} spenderAddress
 */
export type ERC20Item = {
  /**  The type to indicate this is an ERC20 item. */
  type: ItemType.ERC20;
  /** The token address of the ERC20. */
  tokenAddress: string;
  /** The amount of the item. */
  amount: BigNumber;
  /** The contract address of the approver. */
  spenderAddress: string,
};

/**
 * Represents an ERC721 item.
 * @property {ItemType} type
 * @property {string} contractAddress
 * @property {string} id
 * @property {string} spenderAddress
 */
export type ERC721Item = {
  /** The type to indicate this is an ERC721 item. */
  type: ItemType.ERC721;
  /** The contract address of the ERC721 collection. */
  contractAddress: string;
  /**  The ID of this ERC721 in the collection. */
  id: string;
  /** The contract address of the approver. */
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
 * @property {TransactionOrGasType} type
 * @property {TransactionRequest} transaction
 */
export type FulfillmentTransaction = {
  /** The type to indicate this is a fulfillment transaction. */
  type: TransactionOrGasType.TRANSACTION;
  /** The transaction to send. */
  transaction: TransactionRequest;
};

/**
 * The gas amount which contains the gas token and the gas limit.
 * @property {TransactionOrGasType} type
 * @property {GasToken} gasToken
 */
export type GasAmount = {
  /** The type to indicate this is a gas amount. */
  type: TransactionOrGasType.GAS;
  /** The gas token. */
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
 * @property {GasTokenType} type
 * @property {BigNumber} limit
 */
export type NativeGas = {
  /** The type to indicate this is a native gas token. */
  type: GasTokenType.NATIVE,
  /** The gas limit. */
  limit: BigNumber;
};

/**
 * Represents an ERC20 gas token.
 * @property {GasTokenType} type
 * @property {string} tokenAddress
 * @property {BigNumber} limit
 */
export type ERC20Gas = {
  /** The type to indicate this is an ERC20 gas token. */
  type: GasTokenType.ERC20,
  /** The token address of the ERC20. */
  tokenAddress: string;
  /** The gas limit. */
  limit: BigNumber;
};

/**
 * The type representing the result of {@link Checkout.smartCheckout}.
 */
export type SmartCheckoutResult = SmartCheckoutSufficient | SmartCheckoutInsufficient;

/**
 * Represents the result of {@link Checkout.smartCheckout} when smart checkout is sufficient.
 * @property {boolean} sufficient
 * @property {TransactionRequirement[]} transactionRequirements
 */
export type SmartCheckoutSufficient = {
/** Indicates that smart checkout determined the user had sufficient funds. */
  sufficient: true,
  /** The transaction requirements smart checkout determined were required for the transaction. */
  transactionRequirements: TransactionRequirement[],
};

/**
 * Represents the result of {@link Checkout.smartCheckout} when smart checkout is insufficient.
 * @property {boolean} sufficient
 * @property {TransactionRequirement[]} transactionRequirements
 * @property {SmartCheckoutRouter} router
 */
export type SmartCheckoutInsufficient = {
  /** Indicates that smart checkout determined the user has insufficient funds */
  sufficient: false,
  /** The transaction requirements smart checkout determined were required for the transaction. */
  transactionRequirements: TransactionRequirement[],
  /** The type containing the funding routes the user can take to fulfill the transaction requirements */
  router: SmartCheckoutRouter
};

/**
 * Represents the routing outcome for a transaction.
 * @property {AvailableRoutingOptions} availableRoutingOptions
 * @property {RoutingOutcome} routingOutcome
 */
export type SmartCheckoutRouter = {
  /** The routing options available to the user */
  availableRoutingOptions: AvailableRoutingOptions,
  /** The routing outcome for the transaction which includes the funding routes if routes were found */
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
 * Represents a routing outcome where funding routes were found.
 * @property {RoutingOutcomeType.ROUTES_FOUND} type
 * @property {AvailableRoutingOptions} fundingRoutes
 */
export type RoutesFound = {
/** Indicates that funding routes were found for the transaction. */
  type: RoutingOutcomeType.ROUTES_FOUND,
  /** The funding routes found for the transaction. */
  fundingRoutes: FundingRoute[]
};

/**
 * Represents a routing outcome where no funding routes were found.
 * @property {RoutingOutcomeType.NO_ROUTES_FOUND} type
 * @property {string} message
 */
export type NoRoutesFound = {
  /** Indicates that no funding routes were found for the transaction. */
  type: RoutingOutcomeType.NO_ROUTES_FOUND,
  /** The message indicating why no funding routes were found. */
  message: string
};

/**
 * Represents a routing outcome where no routing options were available for the transaction.
 * @property {RoutingOutcomeType.NO_ROUTE_OPTIONS} type
 * @property {string} message
 */
export type NoRouteOptions = {
  /** Indicates that no routing options were available for the transaction. */
  type: RoutingOutcomeType.NO_ROUTE_OPTIONS,
  /** The message indicating why no routing options were available. */
  message: string
};

/**
 * Represents a funding route
 * @property {number} priority
 * @property {FundingStep[]} steps
 */
export type FundingRoute = {
  /** The priority of the route */
  priority: number;
  /** The steps associated with this funding route */
  steps: FundingStep[]
};

/**
 * Represents a fee
 * @property {BigNumber} amount
 * @property {string} formatted
 * @property {TokenInfo | undefined} token
 */
export type Fee = {
  /** The type of fee */
  type: FeeType;
  /** The amount of the fee */
  amount: BigNumber;
  /** The formatted amount of the fee */
  formattedAmount: string;
  /** The token info for the fee */
  token?: TokenInfo;
};

/**
 * An enum representing the funding step types
 * @enum {string}
 * @property {string} GAS - If the fee is a gas fee.
 * @property {string} BRIDGE_FEE - If the fee is a bridge fee.
 * @property {string} SWAP_FEE - If the fee is a swap fee.
 * @property {string} IMMUTABLE_FEE - If the fee is an immutable fee.
 */
export enum FeeType {
  GAS = 'GAS',
  BRIDGE_FEE = 'BRIDGE_FEE',
  SWAP_FEE = 'SWAP_FEE',
  IMMUTABLE_FEE = 'IMMUTABLE_FEE',
}

/*
* Type representing the various funding steps
*/
export type FundingStep = BridgeFundingStep | SwapFundingStep | OnRampFundingStep;

/**
 * Represents a bridge funding route
 * @property {FundingStepType.BRIDGE} type
 * @property {number} chainId
 * @property {FundingItem} fundingItem
 * @property {BridgeFees} fees
 */
export type BridgeFundingStep = {
  /** Indicates that this is a bridge funding step */
  type: FundingStepType.BRIDGE,
  /** The chain id the bridge should be executed on */
  chainId: number,
  /** The funding item for the bridge */
  fundingItem: FundingItem,
  /** The fees for the bridge */
  fees: BridgeFees,
};

/**
 * Represents the fees for a bridge funding step
 * @property {Fee} approvalGasFee
 * @property {Fee} bridgeGasFee
 * @property {Fee[]} bridgeFees
 */
export type BridgeFees = {
  /** The approval gas fee for the bridge */
  approvalGasFee: Fee,
  /** The bridge gas fee for the bridge */
  bridgeGasFee: Fee,
  /** Additional bridge fees for the bridge */
  bridgeFees: Fee[],
};

/**
 * Represents a swap funding route
 * @property {FundingStepType.SWAP} type
 * @property {number} chainId
 * @property {FundingItem} fundingItem
 * @property {SwapFees} fees
 */
export type SwapFundingStep = {
  /** Indicates that this is a swap funding step */
  type: FundingStepType.SWAP,
  /** The chain id the swap should be executed on */
  chainId: number,
  /** The funding item for the swap */
  fundingItem: FundingItem,
  /** The fees for the swap */
  fees: SwapFees,
};

/**
 * Represents the fees for a swap funding step
 * @property {Fee} approvalGasFee
 * @property {Fee} swapGasFee
 * @property {Fee[]} swapFees
 */
export type SwapFees = {
  /** The approval gas fee for the swap */
  approvalGasFee: Fee,
  /** The swap gas fee for the swap */
  swapGasFee: Fee,
  /** Additional swap fees for the swap */
  swapFees: Fee[],
};

/**
 * Represents an onramp funding route
 * @property {FundingStepType.ONRAMP} type
 * @property {number} chainId
 * @property {FundingItem} fundingItem
 */
export type OnRampFundingStep = {
  /** Indicates that this is an onramp funding step */
  type: FundingStepType.ONRAMP,
  /** The chain id the onramp should provide funds to */
  chainId: number,
  /** The item to be onramped */
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

/**
 * Represents a funding item
 * @property {ItemType.NATIVE | ItemType.ERC20} type
 * @property {FundsRequired} fundsRequired
 * @property {UserBalance} userBalance
 * @property {TokenInfo} token
 */
export type FundingItem = {
  /** The type of the funding item */
  type: ItemType.NATIVE | ItemType.ERC20,
  /** The amount of funds required of this funding item */
  fundsRequired: FundsRequired,
  /** The current user balance of this funding item */
  userBalance: UserBalance,
  /** The token info for the funding item */
  token: TokenInfo
};

/**
 * Represents the funds required of a funding item
 * @property {BigNumber} amount
 * @property {string} formattedAmount
 */
export type FundsRequired = {
  /** The amount of funds required */
  amount: BigNumber,
  /** The formatted amount of funds required */
  formattedAmount: string
};

/**
 * Represents the user balance of a funding item
 * @property {BigNumber} balance
 * @property {string} formattedBalance
 */
export type UserBalance = {
  /** The balance of the funding item */
  balance: BigNumber,
  /** The formatted balance of the funding item */
  formattedBalance: string
};

/**
 * Represents the transaction requirement for a transaction.
 * @property {ItemType} type
 * @property {boolean} sufficient
 * @property {ItemBalance} required
 * @property {ItemBalance} current
 * @property {BalanceDelta} delta
 */
export type TransactionRequirement = {
  /** The type of the transaction requirement. */
  type: ItemType,
  /** If the user address has sufficient funds to cover the transaction. */
  sufficient: boolean;
  /** The required item balance. */
  required: ItemBalance,
  /** The current item balance. */
  current: ItemBalance,
  /** The delta between the required and current balances. */
  delta: BalanceDelta,
};

/**
 * Represents the balance for either a native or ERC20 token.
 * @property {ItemType.NATIVE | ItemType.ERC20} type
 * @property {BigNumber} balance
 * @property {string} formattedBalanc
 * @property {TokenInfo} token
 */
export type TokenBalance = {
  /** Type to indicate this is a native or ERC20 token. */
  type: ItemType.NATIVE | ItemType.ERC20;
  /** The balance of the item. */
  balance: BigNumber;
  /** The formatted balance of the item. */
  formattedBalance: string;
  /**  The token info of the item. */
  token: TokenInfo;
};

/**
 * Represents the balance for an ERC721.
 * @property {ItemType.ERC721} type
 * @property {BigNumber} balance
 * @property {string} formattedBalance
 * @property {string} contractAddress
 * @property {string} id
 */
export type ERC721Balance = {
  /** Type to indicate this is an ERC721 token. */
  type: ItemType.ERC721,
  /** The balance of the item. */
  balance: BigNumber;
  /** The formatted balance of the item. */
  formattedBalance: string;
  /** The contract address of the ERC721 collection. */
  contractAddress: string;
  /** The ID of the ERC721 in the collection */
  id: string;
};

/**
 * Type representing the balance of an item.
 */
export type ItemBalance = ERC721Balance | TokenBalance;

/**
 * Represents the delta between two balances.
 * @property {BigNumber} balance
 * @property {string} formattedBalance
 */
export type BalanceDelta = {
  /** The delta of the balance. */
  balance: BigNumber;
  /** The formatted balance of the delta. */
  formattedBalance: string;
};

/**
 * A type representing the Smart Checkout routing options available for a user
 * if they are configured and enabled (not geo-blocked etc.)
 * @property {boolean | undefined} onRamp
 * @property {boolean | undefined} swap
 * @property {boolean | undefined} bridge
 */
export type AvailableRoutingOptions = {
  /** If the user can use onramp */
  onRamp?: boolean;
  /** If the user can use swap */
  swap?: boolean;
  /** If the user can use bridge */
  bridge?: boolean;
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
