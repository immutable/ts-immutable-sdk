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
 * @property {CheckoutStatus.SUCCESS} status - The status to indicate success
 * @property {SmartCheckoutSufficient} smartCheckoutResult - The sufficient result of smart checkout
 */
export type BuyResultSuccess = {
  status: CheckoutStatus.SUCCESS,
  smartCheckoutResult: SmartCheckoutSufficient
};

/**
 * Represents the result of {@link Checkout.buy}
 * @property {CheckoutStatus.FAILED} status - The status to indicate failure
 * @property {string} transactionHash - The transaction hash of the failed transaction
 * @property {string} reason - The reason for the failure
 * @property {SmartCheckoutSufficient} smartCheckoutResult - The sufficient result of smart checkout
 */
export type BuyResultFailed = {
  status: CheckoutStatus.FAILED,
  transactionHash: string,
  reason: string,
  smartCheckoutResult: SmartCheckoutSufficient
};

/**
 * Represents the result of {@link Checkout.buy}
 * @property {CheckoutStatus.INSUFFICIENT_FUNDS} status - The status to indicate insufficient funds
 * @property {SmartCheckoutInsufficient} smartCheckoutResult - The insufficient result of smart checkout
 */
export type BuyResultInsufficientFunds = {
  status: CheckoutStatus.INSUFFICIENT_FUNDS,
  smartCheckoutResult: SmartCheckoutInsufficient
};

/*
* Type representing the result of the sell
*/
export type SellResult = SellResultSuccess | SellResultFailed | SellResultInsufficientFunds;

/**
 * Represents the result of {@link Checkout.sell}
 * @property {CheckoutStatus.SUCCESS} status - The status to indicate success
 * @property {SmartCheckoutSufficient} smartCheckoutResult - The sufficient result of smart checkout
 */
export type SellResultSuccess = {
  status: CheckoutStatus.SUCCESS,
  orderIds: string[],
  smartCheckoutResult: SmartCheckoutSufficient
};

/**
 * Represents the result of {@link Checkout.sell}
 * @property {CheckoutStatus.FAILED} status - The status to indicate failure
 * @property {string} transactionHash - The transaction hash of the failed transaction
 * @property {string} reason - The reason for the failure
 * @property {SmartCheckoutSufficient} smartCheckoutResult - The sufficient result of smart checkout
 */
export type SellResultFailed = {
  status: CheckoutStatus.FAILED,
  transactionHash: string,
  reason: string,
  smartCheckoutResult: SmartCheckoutSufficient
};

/**
 * Represents the result of {@link Checkout.sell}
 * @property {CheckoutStatus.INSUFFICIENT_FUNDS} status - The status to indicate insufficient funds
 * @property {SmartCheckoutInsufficient} smartCheckoutResult - The insufficient result of smart checkout
 */
export type SellResultInsufficientFunds = {
  status: CheckoutStatus.INSUFFICIENT_FUNDS,
  smartCheckoutResult: SmartCheckoutInsufficient
};

/*
* Type representing the result of the cancel
*/
export type CancelResult = CancelResultSuccess | CancelResultFailed;

/**
 * Represents the result of {@link Checkout.cancel}
 * @property {CheckoutStatus.SUCCESS} status - The status to indicate success
 */
export type CancelResultSuccess = {
  status: CheckoutStatus.SUCCESS,
};

/**
 * Represents the result of {@link Checkout.cancel}
 * @property {CheckoutStatus.FAILED} status - The status to indicate failure
 * @property {string} transactionHash - The transaction hash of the failed transaction
 * @property {string} reason - The reason for the failure
 */
export type CancelResultFailed = {
  status: CheckoutStatus.FAILED,
  transactionHash: string,
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
 * @property {string} orderId - the id of the order to buy
 * @property {Array<OrderFee>} takerFees - array of order fees to apply to the order
 */
export type BuyOrder = {
  id: string,
  takerFees?: OrderFee[],
};

/**
 * The type representing the sell order to create a listing from
 * @property {SellToken} sellToken - the token to be listed for sale
 * @property {BuyToken} buyToken - the token info of the price of the item
 * @property {OrderFee[]} makerFees - option array of makerFees to be applied to the listing
 */
export type SellOrder = {
  sellToken: SellToken,
  buyToken: BuyToken,
  makerFees?: OrderFee[],
};

/**
 * Represents the token that the item can be bought with once listed for sale.
 * NativeBuyToken or ERC20BuyToken {@link Checkout.smartCheckout}.
 */
export type BuyToken = NativeBuyToken | ERC20BuyToken;

/**
 * Represents a native buy token
 * @property {ItemType} type - The type indicate this is a native token.
 * @property {string} amount - The amount of native token.
 */
export type NativeBuyToken = {
  type: ItemType.NATIVE;
  amount: string;
};

/**
 * Represents a ERC20 buy token
 * @property {ItemType} type - The type indicate this is a ERC20 token.
 * @property {string} amount - The amount of native token.
 * @property {string} contractAddress - The contract address of the ERC20.
 */
export type ERC20BuyToken = {
  type: ItemType.ERC20;
  amount: string;
  contractAddress: string;
};

/**
 * The SellToken type
 * @property {string} id - The ERC721 token id
 * @property {string} collectionAddress - The ERC721 collection address
 */
export type SellToken = {
  id: string,
  collectionAddress: string
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

/**
 * Represents a native item requirement for a transaction.
 * @property {ItemType.NATIVE} type - The type to indicate this is a native item requirement.
 * @property {string} amount - The amount of the item.
 */
export type NativeItemRequirement = {
  type: ItemType.NATIVE;
  amount: string;
};

/**
 * Represents an ERC20 item requirement for a transaction.
 * @property {ItemType.ERC20} type - The type to indicate this is a ERC20 item requirement.
 * @property {string} amount - The amount of the item.
 * @property {string} contractAddress - The contract address of the ERC20.
 * @property {string} spenderAddress - The contract address of the approver.
 */
export type ERC20ItemRequirement = {
  type: ItemType.ERC20;
  contractAddress: string;
  amount: string;
  spenderAddress: string,
};

/**
 * Represents an ERC721 item requirement for a transaction.
 * @property {ItemType.ERC721} type - The type to indicate this is a ERC721 item requirement.
 * @property {string} contractAddress - The contract address of the ERC721 collection.
 * @property {string} id - The ID of this ERC721 in the collection.
 * @property {string} spenderAddress - The contract address of the approver.
 */
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
 * @property {string} contractAddress - The contract address of the ERC721 collection.
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
 * @property {AvailableRoutingOptions} availableRoutingOptions - The routing options available to the user
 * @property {RoutingOutcome} routingOutcome - The routing outcome for the transaction which
 * includes the funding routes if routes were found
 */
export type SmartCheckoutRouter = {
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
 * Represents a routing outcome where funding routes were found.
 * @property {RoutingOutcomeType.ROUTES_FOUND} type - Indicates that funding routes were found for the transaction.
 * @property {AvailableRoutingOptions} fundingRoutes - The funding routes found for the transaction.
 */
export type RoutesFound = {
  type: RoutingOutcomeType.ROUTES_FOUND,
  fundingRoutes: FundingRoute[]
};

/**
 * Represents a routing outcome where no funding routes were found.
 * @property {RoutingOutcomeType.NO_ROUTES_FOUND} type - Indicates that no funding routes were found for the transaction.
 * @property {string} message - The message indicating why no funding routes were found.
 */
export type NoRoutesFound = {
  type: RoutingOutcomeType.NO_ROUTES_FOUND,
  message: string
};

/**
 * Represents a routing outcome where no routing options were available for the transaction.
 * @property {RoutingOutcomeType.NO_ROUTE_OPTIONS} type - Indicates that no routing options were available for the transaction.
 * @property {string} message - The message indicating why no routing options were available.
 */
export type NoRouteOptions = {
  type: RoutingOutcomeType.NO_ROUTE_OPTIONS,
  message: string
};

/**
 * Represents a funding route
 * @property {number} priority - The priority of the route
 * @property {FundingStep[]} steps - The steps associated with this funding route
 */
export type FundingRoute = {
  priority: number;
  steps: FundingStep[]
};

/**
 * Represents a fee
 * @property {BigNumber} amount - The amount of the fee
 * @property {string} formatted - The formatted amount of the fee
 * @property {TokenInfo | undefined} token - The token info for the fee
 */
export type Fee = {
  amount: BigNumber;
  formattedAmount: string;
  token?: TokenInfo;
};

/*
* Type representing the various funding steps
*/
export type FundingStep = BridgeFundingStep | SwapFundingStep | OnRampFundingStep;

/**
 * Represents a bridge funding route
 * @property {FundingStepType.BRIDGE} type - Indicates that this is a bridge funding step
 * @property {number} chainId - The chain id the bridge should be executed on
 * @property {FundingItem} fundingItem - The funding item for the bridge
 * @property {BridgeFees} fees - The fees for the bridge
 */
export type BridgeFundingStep = {
  type: FundingStepType.BRIDGE,
  chainId: number,
  fundingItem: FundingItem,
  fees: BridgeFees,
};

/**
 * Represents the fees for a bridge funding step
 * @property {Fee} approvalGasFees - The approval gas fees for the bridge
 * @property {Fee} bridgeGasFees - The bridge gas fees for the bridge
 * @property {Fee[]} bridgeFees - Additional bridge fees for the bridge
 */
export type BridgeFees = {
  approvalGasFees: Fee,
  bridgeGasFees: Fee,
  bridgeFees: Fee[],
};

/**
 * Represents a swap funding route
 * @property {FundingStepType.SWAP} type - Indicates that this is a swap funding step
 * @property {number} chainId - The chain id the swap should be executed on
 * @property {FundingItem} fundingItem - The funding item for the swap
 * @property {SwapFees} fees - The fees for the swap
 */
export type SwapFundingStep = {
  type: FundingStepType.SWAP,
  chainId: number,
  fundingItem: FundingItem,
  fees: SwapFees,
};

/**
 * Represents the fees for a swap funding step
 * @property {Fee} approvalGasFees - The approval gas fees for the swap
 * @property {Fee} swapGasFees - The swap gas fees for the swap
 * @property {Fee[]} swapFees - Additional swap fees for the swap
 */
export type SwapFees = {
  approvalGasFees: Fee,
  swapGasFees: Fee,
  swapFees: Fee[],
};

/**
 * Represents an onramp funding route
 * @property {FundingStepType.ONRAMP} type - Indicates that this is an onramp funding step
 * @property {number} chainId - The chain id the onramp should provide funds to
 * @property {FundingItem} fundingItem - The item to be onramped
 */
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

/**
 * Represents a funding item
 * @property {ItemType.NATIVE | ItemType.ERC20} type - The type of the funding item
 * @property {FundsRequired} fundsRequired - The amount of funds required of this funding item
 * @property {UserBalance} userBalance - The current user balance of this funding item
 * @property {TokenInfo} token - The token info for the funding item
 */
export type FundingItem = {
  type: ItemType.NATIVE | ItemType.ERC20,
  fundsRequired: FundsRequired,
  userBalance: UserBalance,
  token: TokenInfo
};

/**
 * Represents the funds required of a funding item
 * @property {BigNumber} amount - The amount of funds required
 * @property {string} formattedAmount - The formatted amount of funds required
 */
export type FundsRequired = {
  amount: BigNumber,
  formattedAmount: string
};

/**
 * Represents the user balance of a funding item
 * @property {BigNumber} balance - The balance of the funding item
 * @property {string} formattedBalance - The formatted balance of the funding item
 */
export type UserBalance = {
  balance: BigNumber,
  formattedBalance: string
};

/**
 * Represents the transaction requirement for a transaction.
 * @property {ItemType} type - The type of the transaction requirement.
 * @property {boolean} sufficient - If the user address has sufficient funds to cover the transaction.
 * @property {ItemBalance} required - The required item balance.
 * @property {ItemBalance} current - The current item balance.
 * @property {BalanceDelta} delta - The delta between the required and current balances.
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
 * @property {ItemType.NATIVE | ItemType.ERC20} type - Type to indicate this is a native or ERC20 token.
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
 * Represents the balance for an ERC721.
 * @property {ItemType.ERC721} type - Type to indicate this is an ERC721 token.
 * @property {BigNumber} balance - The balance of the item.
 * @property {string} formattedBalance - The formatted balance of the item.
 * @property {string} contractAddress - The contract address of the ERC721 collection.
 * @property {string} id - The ID of the ERC721 in the collection.
 */
export type ERC721Balance = {
  type: ItemType.ERC721,
  balance: BigNumber;
  formattedBalance: string;
  contractAddress: string;
  id: string;
};

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
 * @property {boolean | undefined} onRamp - If the user can use onramp
 * @property {boolean | undefined} swap - If the user can use swap
 * @property {boolean | undefined} bridge - If the user can use bridge
 */
export type AvailableRoutingOptions = {
  onRamp?: boolean;
  swap?: boolean;
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
