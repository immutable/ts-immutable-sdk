import { ModuleConfiguration } from '@imtbl/config';
import { ethers } from 'ethers';

/**
 * @typedef {Object} BridgeInstance
 * @property {string} rootChainID - The root chain ID.
 * @property {string} childChainID - The child chain ID.
 */
export type BridgeInstance = {
  rootChainID: string;
  childChainID: string;
};

/**
 * @typedef {Object} BridgeOverrides
 * @property {BridgeContracts} bridgeContracts - The bridge contracts configuration.
 */
export interface BridgeOverrides {
  bridgeContracts: BridgeContracts;
}

/**
 * @typedef {Object} AxelarChainDetails
 * @property {string} id - The ChainId of the network.
 * @property {string} symbol - The Symbol of the native token.
 */
export interface AxelarChainDetails {
  id: string,
  symbol: string,
}

/**
 * @typedef {Object} BridgeContracts
 * @property {Address} rootChainERC20Predicate - The address of the root chain ERC20 predicate contract.
 * @property {Address} rootChainStateSender - The address of the root chain state sender contract.
 * @property {Address} childChainERC20Predicate - The address of the child chain ERC20 predicate contract.
 * @property {Address} childChainStateReceiver - The address of the child chain state receiver contract.
 */
export type BridgeContracts = {
  rootERC20BridgeFlowRate: Address;
  rootAxelarAdapter: Address;
  childERC20Bridge: Address;
  childAxelarAdapter: Address;
  rootChainIMX: Address;
  rootChainWrappedETH: Address;
  childChainWrappedETH: Address;
  childChainWrappedIMX: Address;
};

/**
 * @typedef {Object} BridgeModuleConfiguration
 * @extends {ModuleConfiguration<BridgeOverrides>}
 * @property {BridgeInstance} bridgeInstance - The bridge instance configuration.
 * @property {ethers.providers.Provider} rootProvider - The root chain provider.
 * @property {ethers.providers.Provider} childProvider - The child chain provider.
 */
export interface BridgeModuleConfiguration
  extends ModuleConfiguration<BridgeOverrides> {
  bridgeInstance: BridgeInstance;
  rootProvider: ethers.providers.Provider;
  childProvider: ethers.providers.Provider;
}

/**
 * @typedef {string} Address - Represents an Ethereum address.
 */
export type Address = string;

/**
 * @typedef {Address | 'NATIVE'} FungibleToken - Represents a fungible token, either an ERC20 token address or the native token.
 */
export type FungibleToken = Address | 'NATIVE';

/**
 * @typedef {Object} CompletionStatus
 * @property {string} SUCCESS - The transaction has been successfully synced.
 * @property {string} PENDING - The transaction is still pending.
 * @property {string} FAILED - The transaction has failed.
 */
export enum CompletionStatus {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
}

/**
 * @typedef {Object} BridgeFeeActions
 * @property {string} DEPOSIT - The transaction has been successfully synced.
 * @property {string} WITHDRAW - The transaction is still pending.
 * @property {string} FINALISE_WITHDRAWAL - Calculate gas .
 */
export enum BridgeFeeActions {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  FINALISE_WITHDRAWAL = 'FINALISE_WITHDRAWAL',
}

/**
 * @typedef {Object} BridgeMethodGas
 * @property {string} DEPOSIT_SOURCE - The gas required to deposit to the bridge.
 * @property {string} DEPOSIT_DESTINATION - The gas required to process the deposit on the destination chain.
 * @property {string} WITHDRAW_SOURCE - The gas required to withdraw from the bridge.
 * @property {string} WITHDRAW_DESTINATION - The gas required to process the withdrawal on the destination chain.
 * @property {string} FINALISE_WITHDRAWAL - The gas required to finalise a withdrawal from the flow rate queue.
 */
export enum BridgeMethodsGasLimit { // @TODO test methods on chain and put correct values here
  DEPOSIT_SOURCE = 150000,
  DEPOSIT_DESTINATION = 160000,
  WITHDRAW_SOURCE = 150000,
  WITHDRAW_DESTINATION = 155000,
  MAP_TOKEN_SOURCE = 200000,
  MAP_TOKEN_DESTINATION = 200000,
  FINALISE_WITHDRAWAL = 200000,
  APPROVE_TOKEN = 50000,
}

export interface FeeData {
  lastBaseFeePerGas: null | ethers.BigNumber;
  maxFeePerGas: null | ethers.BigNumber;
  maxPriorityFeePerGas: null | ethers.BigNumber;
  gasPrice: null | ethers.BigNumber;
}

/**
 * @typedef {Object} BridgeFeeRequest
 * @dev Union type of DepositFeeRequest|WithdrawFeeRequest|FinaliseFeeRequest|MapTokenFeeRequest
 * ensures the correct params are supplied when trying to calculate the fees
 */
export type BridgeFeeRequest = DepositOrWithdrawFeeRequest | FinaliseFeeRequest;

/**
 * @typedef {Object} DepositOrWithdrawFeeRequest
 * @property {BridgeFeeActions} method - The method for which the bridge fee is being requested.
 * @property {number} gasMultiplier - How much buffer to add to the gas fee.
 * @property {string} sourceChainId - The chain ID of the source chain.
 * @property {string} destinationChainId - The chain ID of the destination chain.
 * @property {FungibleToken} token - The token to be bridged.
 * @property {ethers.BigNumber} amount - The amount to be bridged.
 * @property {Address} senderAddress - The sender address or '0x0' if unknown.
 * @property {Address} recipientAddress - The recipient address or '0x0' if unknown.
 * @dev Parsing 0x0 for either the senderAddress or recipient address will cause the fee estimator
 * to revert back to using static values and will always return the approval transction fee since
 * we are unable to check the allowance amount since no address was parsed.
 * @dev having the senderAddress and recipientAddress able to be set to 0x0 prevents causing a breaking
 * change in the Checkout SDK. This functionality should be deprecated over time and the Checkout SDK's
 * 'estimateGas' method should require the currently optional params to be required.
 */
export interface DepositOrWithdrawFeeRequest {
  action: BridgeFeeActions,
  gasMultiplier: number;
  sourceChainId: string;
  destinationChainId: string;
  token: FungibleToken,
  amount: ethers.BigNumber;
  senderAddress: Address;
  recipientAddress: Address;
}

/**
 * @typedef {Object} FinaliseFeeRequest
 * @property {BridgeFeeActions} method - The method for which the bridge fee is being requested.
 * @property {string} sourceChainId - The chain ID of the source chain.
 */
export interface FinaliseFeeRequest {
  action: BridgeFeeActions.FINALISE_WITHDRAWAL,
  sourceChainId: string;
}

export interface GetAllowanceResponse {
  erc20Contract: ethers.Contract,
  allowance: ethers.BigNumber,
  amount: ethers.BigNumber,
  amountToApprove: ethers.BigNumber,
  contractToApprove: string,
}

/**
 * @typedef {Object} BridgeFeeResponse
 * @property {ethers.BigNumber} sourceChainGas - Gas cost to send tokens to the bridge contract on the source chain.
 * - priced in the source chain's native token.
 * @property {ethers.BigNumber} approvalFee - Gas cost to approve bridge contract to spend tokens on the source chain.
 * - priced in the source chain's native token.
 * @property {ethers.BigNumber} bridgeFee - destinationChainGas + validatorFee.
 * This will be added to the tx.value of the bridge transaction and forwarded to the Axelar Gas Service contract.
 * - priced in the source chain's native token.
 * @property {ethers.BigNumber} imtblFee - The fee charged by Immutable to facilitate the bridge.
 * - priced in the source chain's native token.
 * @property {ethers.BigNumber} totalFees - The total fees the user will be charged which is;
 * sourceChainGas + approvalFee + bridgeFee + imtblFee.
 * - priced in the source chain's native token.
 */
export interface BridgeFeeResponse {
  sourceChainGas: ethers.BigNumber,
  approvalFee: ethers.BigNumber,
  bridgeFee: ethers.BigNumber,
  imtblFee: ethers.BigNumber,
  totalFees: ethers.BigNumber,
}

export interface TenderlyGasEstimatesResponse {
  approvalFee: number,
  sourceChainGas: number,
}

/**
 * @typedef {Object} CalculateBridgeFeeResponse
 * @property {ethers.BigNumber} bridgeFee - Fee charged by Axelar to validate and execute the bridge message.
 */
export interface CalculateBridgeFeeResponse {
  bridgeFee: ethers.BigNumber;
}

/**
 * @typedef {Object} ApproveBridgeRequest
 * @property {string} senderAddress - The address of the depositor.
 * @property {FungibleToken} token - The token to be approved.
 * @property {ethers.BigNumber} amount - The amount to be approved for deposit.
 * @property {string} sourceChainId - The chain ID of the source chain.
 * @property {string} destinationChainId - The chain ID of the destination chain.
 */
export interface ApproveBridgeRequest {
  senderAddress: Address;
  token: FungibleToken;
  amount: ethers.BigNumber;
  sourceChainId: string;
  destinationChainId: string;
}

/**
 * @typedef {Object} ApproveBridgeResponse
 * @property {ethers.providers.TransactionRequest | null} unsignedTx - The unsigned transaction for the token approval,
 * or null if no approval is required.
 */
export interface ApproveBridgeResponse {
  contractToApprove: string | null,
  unsignedTx: ethers.providers.TransactionRequest | null;
}

/**
 * @typedef {Object} BridgeTxRequest
 * @property {Address} senderAddress - The address of the depositor.
 * @property {Address} recipientAddress - The address of the recipient.
 * @property {FungibleToken} token - The token to be deposited.
 * @property {ethers.BigNumber} amount - The amount to be deposited.
 * @property {string} sourceChainId - The chain ID of the source chain.
 * @property {string} destinationChainId - The chain ID of the destination chain.
*/
export interface BridgeTxRequest {
  senderAddress: Address;
  recipientAddress: Address;
  token: FungibleToken;
  amount: ethers.BigNumber;
  sourceChainId: string;
  destinationChainId: string;
  gasMultiplier: number;
}

/**
 * @typedef {Object} BridgeTxResponse
 * @property {BridgeFeeResponse} fees - The fees associated with the Bridge transaction.
 * @property {ethers.providers.TransactionRequest} unsignedTx - The unsigned transaction for the deposit.
 */
export interface BridgeTxResponse {
  feeData: BridgeFeeResponse,
  unsignedTx: ethers.providers.TransactionRequest;
}

/**
 * @typedef {Object} TxStatusRequest
 * @property {string} sourceChainId - The chain ID of the source chain.
 * @property {Array<TxStatusRequestItem>} transactions - The transaction items to query the status for.
 */
export interface TxStatusRequest {
  transactions: Array<TxStatusRequestItem>
  sourceChainId: string;
}

/**
 * @typedef {Object} TxStatusRequestItem
 * @property {string} txHash - The transaction hash on the source chain of the bridge transaction.
*/
export interface TxStatusRequestItem {
  txHash: string;
}

/**
 * @typedef {Object} TxStatusResponse
 * @property {Array<TxStatusResponseItem>} transactions - The status items of the requested transactions.
 */
export interface TxStatusResponse {
  transactions: Array<TxStatusResponseItem>
}

/**
 * @typedef {Object} AxelarStatusResponse
 * @property {Array<TxStatusResponseItem>} txStatusItems - The status items of the requested transactions.
 * @property {Array<string>} uniqueReceivers - The unique receivers to look up in the flow rate queue.
 */
export interface AxelarStatusResponse {
  txStatusItems: Array<TxStatusResponseItem>,
  uniqueReceivers: Array<string>,
}

/**
 * @typedef {Object} TxStatusResponseItem
 * @property {string} txHash - The transaction hash on the source chain of the bridge transaction.
 * @property {Address} sender - The address of the sender on the source chain.
 * @property {Address} recipient - The address of the recipient on the destination chain.
 * @property {FungibleToken} token - The token being bridged.
 * @property {ethers.BigNumber} amount - The amount of the transaction.
 * @property {StatusResponse} status - The status of the transaction.
 * @property {any} data - Any extra data relevant to the transaction.
*/
export interface TxStatusResponseItem {
  txHash: string;
  sender: Address;
  recipient: Address;
  token: FungibleToken;
  amount: ethers.BigNumber;
  status: StatusResponse;
  data: any;
}

export enum StatusResponse {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  RETRY = 'RETRY',
  ERROR = 'ERROR',
  NOT_ENOUGH_GAS = 'NOT_ENOUGH_GAS',
  FLOW_RATE_CONTROLLED = 'FLOW_RATE_CONTROLLED',
}

/**
 * @typedef {Object} FlowRateInfoRequest
 * @property {FungibleToken} token - Optional param to filter the flowRate info by. If not specified info for all tokens will be returned.
*/
export interface FlowRateInfoRequest {
  tokens: Array<FungibleToken>;
}

/**
 * @typedef {Object} FlowRateInfoResponse
 * @property {boolean} withdrawalQueueActivated - True if the withdrawal queue has been activated across all tokens.
 * @property {number} withdrawalDelay - Delay in seconds before queued withdrawal can be procesed.
 * @property {Record<FungibleToken, FlowRateInfoItem>} tokens - The information on the flow rate for each bridgeable token.
*/
export interface FlowRateInfoResponse {
  withdrawalQueueActivated: boolean;
  withdrawalDelay: number;
  tokens: Record<FungibleToken, FlowRateInfoItem>
}

/**
 * @typedef {Object} FlowRateInfoItem
 * @property {string} capacity - The number of tokens that can fit in the bucket, Zero means flow rate is not configured.
 * @property {string} depth - The number of tokens in the bucket.
 * @property {string} refillTime - The last time the bucket was updated.
 * @property {string} refillRate - The number of tokens added per second.
 */
export interface FlowRateInfoItem {
  capacity: ethers.BigNumber;
  depth: ethers.BigNumber;
  refillTime: number;
  refillRate: ethers.BigNumber;
  largeTransferThreshold: ethers.BigNumber;
}

/**
 * @typedef {Object} PendingWithdrawalsRequest
 * @property {Address} recipient - The address for which the pending withdrawals should be retrieved.
 */
export interface PendingWithdrawalsRequest {
  recipient: Address;
}

/**
 * @typedef {Object} PendingWithdrawalsResponse
 * @property {Address} rootToken - The address of the corresponding token on the root chain.
 * @property {Address} childToken - The address of the corresponding token on the child chain.
 */
export interface PendingWithdrawalsResponse {
  pending: Array<PendingWithdrawal>;
}

export interface PendingWithdrawal {
  canWithdraw: boolean,
  withdrawer: Address,
  recipient: Address,
  token: FungibleToken,
  amount: ethers.BigNumber,
  timeoutStart: number,
  timeoutEnd: number,
}

export interface RootBridgePendingWithdrawal {
  withdrawer: Address,
  token: FungibleToken,
  amount: ethers.BigNumber,
  timestamp: ethers.BigNumber,
}

/**
 * @typedef {Object} FlowRateWithdrawRequest
 * @property {FungibleToken} recipient - The address for which the flow rate withdrawal transaction should be constructed.
 * @property {number} index - The index of the flow rate withdrawal to be processed.
 */
export interface FlowRateWithdrawRequest {
  recipient: Address;
  index: number;
}

/**
 * @typedef {Object} FlowRateWithdrawResponse
 * @property {ethers.providers.TransactionRequest} unsignedTx - The unsigned transaction for the flow rate withdrawal.
 */
export interface FlowRateWithdrawResponse {
  pendingWithdrawal: PendingWithdrawal,
  unsignedTx: ethers.providers.TransactionRequest | null;
}

/**
 * @typedef {Object} TokenMappingRequest
 * @property {FungibleToken} rootToken - The token on the root chain for which the corresponding token on the child chain is required.
 */
export interface TokenMappingRequest {
  rootToken: FungibleToken;
  rootChainId: string;
  childChainId: string;
}

/**
 * @typedef {Object} TokenMappingResponse
 * @property {FungibleToken} rootToken - The address of the corresponding token on the root chain.
 * @property {FungibleToken} childToken - The address of the corresponding token on the child chain.
 */
export interface TokenMappingResponse {
  rootToken: FungibleToken;
  childToken: FungibleToken | null;
}
