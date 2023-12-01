/* eslint-disable @typescript-eslint/naming-convention */
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
 * @typedef {Object} BridgeContracts
 * @property {Address} rootChainERC20Predicate - The address of the root chain ERC20 predicate contract.
 * @property {Address} rootChainStateSender - The address of the root chain state sender contract.
 * @property {Address} childChainERC20Predicate - The address of the child chain ERC20 predicate contract.
 * @property {Address} childChainStateReceiver - The address of the child chain state receiver contract.
 */
export type BridgeContracts = {
  rootERC20BridgeFlowRate: Address;
  rootChainStateSender: Address;
  rootChainCheckpointManager: Address;
  rootChainExitHelper: Address;
  childERC20Bridge: Address;
  childChainStateReceiver: Address;
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
 * @typedef {Object} bridgeMethods
 * @property {string} DEPOSIT - The set of contract methods for depositing.
 * @property {string} WITHDRAW - The set of contract methods for withdrawing.
 */
export const bridgeMethods = {
  deposit: {
    token: 'deposit',
    tokenTo: 'depositTo',
    native: 'depositETH',
    nativeTo: 'depositToEth',
  },
  withdraw: {
    token: 'withdraw',
    tokenTo: 'withdrawTo',
    native: 'withdrawIMX',
    nativeTo: 'withdrawToIMX',
  },
};

export interface AxelarChainDetails {
  id: string,
  symbol: string,
}

export const axelarChains:Record<string, AxelarChainDetails> = {
  11155111: {
    id: 'ethereum-sepolia',
    symbol: 'ETH',
  }, // ethereum testnet
  1: {
    id: 'ethereum',
    symbol: 'ETH',
  }, // ethereum mainnet
  13473: {
    id: 'immutable',
    symbol: 'IMX',
  }, // immutable zkevm devnet
  13472: {
    id: 'immutable',
    symbol: 'IMX',
  }, // immutable zkevm testnet
  13371: {
    id: 'immutable',
    symbol: 'IMX',
  }, // immutable zkevm mainnet
};

/**
 * @typedef {Object} BridgeFeeActions
 * @property {string} DEPOSIT - The transaction has been successfully synced.
 * @property {string} WITHDRAW - The transaction is still pending.
 * @property {string} MAP_TOKEN - The transaction has failed.
 * @property {string} FINALISE_WITHDRAWAL - Calculate gas .
 */
export enum BridgeFeeActions {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  MAP_TOKEN = 'MAP_TOKEN',
  FINALISE_WITHDRAWAL = 'FINALISE_WITHDRAWAL',
}

/**
 * @typedef {Object} BridgeMethodGas
 * @property {string} DEPOSIT_SOURCE - The gas required to deposit to the bridge.
 * @property {string} DEPOSIT_DESTINATION - The gas required to process the deposit on the destination chain.
 * @property {string} WITHDRAW_SOURCE - The gas required to withdraw from the bridge.
 * @property {string} WITHDRAW_DESTINATION - The gas required to process the withdrawal on the destination chain.
 * @property {string} MAP_TOKEN_SOURCE - The gas required to request the mapping of a token on the bridge.
 * @property {string} MAP_TOKEN_DESTINATION - The gas required to process the mapping of a token on the destination chain.
 * @property {string} FINALISE_WITHDRAWAL - The gas required to finalise a withdrawal from the flow rate queue.
 */
export enum BridgeMethodsGasLimit { // @TODO test methods on chain and put correct values here
  DEPOSIT_SOURCE = 500000,
  DEPOSIT_DESTINATION = 100000,
  WITHDRAW_SOURCE = 400000,
  WITHDRAW_DESTINATION = 100000,
  MAP_TOKEN_SOURCE = 300000,
  MAP_TOKEN_DESTINATION = 100000,
  FINALISE_WITHDRAWAL = 200000,
}

export interface FeeData {
  lastBaseFeePerGas: null | ethers.BigNumber;
  maxFeePerGas: null | ethers.BigNumber;
  maxPriorityFeePerGas: null | ethers.BigNumber;
  gasPrice: null | ethers.BigNumber;
}

/**
 * @typedef {Object} BridgeFeeRequest
 * @property {BridgeFeeActions} method - The method for which the bridge fee is being requested.
 * @property {string} sourceChainId - The chain ID of the source chain.
 * @property {string} destinationChainId - The chain ID of the destination chain.
 */
export interface BridgeFeeRequest {
  action: BridgeFeeActions;
  gasMultiplier: number;
  sourceChainId: string;
  destinationChainId: string;
}

/**
 * @typedef {Object} BridgeFeeResponse
 * @property {boolean} bridgeable - Indicates whether the token can be bridged or not.
 * @property {ethers.BigNumber} feeAmount - The fee amount for bridging the token.
 */
export interface BridgeFeeResponse {
  sourceChainFee: ethers.BigNumber,
  destinationChainFee: ethers.BigNumber,
  bridgeFee: ethers.BigNumber,
  networkFee: ethers.BigNumber,
  totalFee: ethers.BigNumber,
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
 * @property {Array<TxStatusRequestItem>} - The status items to be queried.
 */
export interface TxStatusRequest extends Array<TxStatusRequestItem> {}

/**
 * @typedef {Object} TxStatusRequestItem
 * @property {string} transactionHash - The transaction hash on the source chain of the bridge transaction.
 * @property {string} sourceChainId - The source chainId.
 */
export interface TxStatusRequestItem {
  transactionHash: string;
}

/**
 * @typedef {Object} TxStatusResponse
 * @property {Array<TxStatusResponseItem>} - The status items to be queried.
 */
export interface TxStatusResponse extends Array<TxStatusResponseItem> {}

/**
 * @typedef {Object} TxStatusResponseItem
 * @property {string} transactionHash - The transaction hash on the source chain of the bridge transaction.
 * @property {string} sourceChainId - The source chainId.
 */
export interface TxStatusResponseItem {
  transactionHash: string;
  status: StatusResponse;
  data: any;
}

export enum StatusResponse {
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  RETRY = 'RETRY',
  ERROR = 'ERROR',
  NOT_ENOUGH_GAS = 'NOT_ENOUGH_GAS',
  FLOW_RATE_CONTROLLED = 'FLOW_RATE_CONTROLLED',
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
  capacity: string;
  depth: string;
  refillTime: number;
  refillRate: string;
}

/**
 * @typedef {Object} PendingWithdrawalsRequest
 * @property {Address} receiver - The address for which the pending withdrawals should be retrieved.
 */
export interface PendingWithdrawalsRequest {
  receiver: Address;
}

/**
 * @typedef {Object} PendingWithdrawalsResponse
 * @property {Address} rootToken - The address of the corresponding token on the root chain.
 * @property {Address} childToken - The address of the corresponding token on the child chain.
 */
export interface PendingWithdrawalsResponse {
  pending: Array<PendingWithdrawals>;
}

export interface PendingWithdrawals {
  withdrawer: Address,
  token: FungibleToken,
  amount: string,
  timeoutStart: number,
  timeoutEnd: number,
}

/**
 * @typedef {Object} FlowRateWithdrawRequest
 * @property {FungibleToken} receiver - The address for which the flow rate withdrawal transaction should be constructed.
 */
export interface FlowRateWithdrawRequest {
  receiver: Address;
}

/**
 * @typedef {Object} FlowRateWithdrawResponse
 * @property {ethers.providers.TransactionRequest} unsignedTx - The unsigned transaction for the flow rate withdrawal.
 */
export interface FlowRateWithdrawResponse {
  unsignedTx: ethers.providers.TransactionRequest;
}

/**
 * @typedef {Object} AddGasRequest
 * @property {string} transactionHash - The hash of the bridge transaction on the source chain for which to add gas to.
 * @property {string} sourceChainId - The source chainId
 * @property {string} amount - The amount of gas to add in the smallest unit of the source chain native token.
 */
export interface AddGasRequest {
  transactionHash: string;
  sourceChainId: string;
  amount: string;
}

/**
 * @typedef {Object} AddGasResponse
 * @property {ethers.providers.TransactionRequest} unsignedTx - The unsigned transaction for the adding more gas.
 */
export interface AddGasResponse {
  unsignedTx: ethers.providers.TransactionRequest;
}

/**
 * @typedef {Object} TokenMappingRequest
 * @property {FungibleToken} rootToken - The token on the root chain for which the corresponding token on the child chain is required.
 */
export interface TokenMappingRequest {
  token: { rootToken: FungibleToken } | { childToken: FungibleToken };
  rootChainId: string;
  childChainId: string;
}

/**
 * @typedef {Object} TokenMappingResponse
 * @property {Address} rootToken - The address of the corresponding token on the root chain.
 * @property {Address} childToken - The address of the corresponding token on the child chain.
 */
export interface TokenMappingResponse {
  rootToken: FungibleToken;
  childToken: Address;
}
