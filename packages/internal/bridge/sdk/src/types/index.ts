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
  rootChainERC20Predicate: Address;
  rootChainStateSender: Address;
  rootChainCheckpointManager: Address;
  rootChainExitHelper: Address;
  childChainERC20Predicate: Address;
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
 * @typedef {Object} BridgeFeeRequest
 * @property {FungibleToken} token - The token for which the bridge fee is being requested.
 */
export interface BridgeFeeRequest {
  token: FungibleToken;
}

/**
 * @typedef {Object} BridgeFeeResponse
 * @property {boolean} bridgeable - Indicates whether the token can be bridged or not.
 * @property {ethers.BigNumber} feeAmount - The fee amount for bridging the token.
 */
export interface BridgeFeeResponse {
  bridgeable: boolean;
  feeAmount: ethers.BigNumber;
}

/**
 * @typedef {Object} ApproveDepositBridgeRequest
 * @property {string} depositorAddress - The address of the depositor.
 * @property {FungibleToken} token - The token to be approved.
 * @property {ethers.BigNumber} depositAmount - The amount to be approved for deposit.
 */
export interface ApproveDepositBridgeRequest {
  depositorAddress: Address;
  token: FungibleToken;
  depositAmount: ethers.BigNumber;
}

/**
 * @typedef {Object} ApproveDepositBridgeResponse
 * @property {ethers.providers.TransactionRequest | null} unsignedTx - The unsigned transaction for the token approval,
 * or null if no approval is required.
 */
export interface ApproveDepositBridgeResponse {
  unsignedTx: ethers.providers.TransactionRequest | null;
}

/**
 * @typedef {Object} BridgeDepositRequest
 * @property {Address} depositorAddress - The address of the depositor.
 * @property {Address} recipientAddress - The address of the recipient.
 * @property {FungibleToken} token - The token to be deposited.
 * @property {ethers.BigNumber} depositAmount - The amount to be deposited.
 */
export interface BridgeDepositRequest {
  recipientAddress: Address;
  token: FungibleToken;
  depositAmount: ethers.BigNumber;
}

/**
 * @typedef {Object} BridgeDepositResponse
 * @property {ethers.providers.TransactionRequest} unsignedTx - The unsigned transaction for the deposit.
 */
export interface BridgeDepositResponse {
  unsignedTx: ethers.providers.TransactionRequest;
}

/**
 * @typedef {Object} WaitForDepositRequest
 * @property {string} transactionHash - The hash of the deposit transaction on the root chain.
 */
export interface WaitForDepositRequest {
  transactionHash: string;
}

/**
 * @typedef {Object} WaitForDepositResponse
 * @property {CompletionStatus} status - The status of the deposit transaction after waiting.
 */
export interface WaitForDepositResponse {
  status: CompletionStatus;
}

/**
 * @typedef {Object} ChildTokenRequest
 * @property {FungibleToken} rootToken - The token on the root chain for which the corresponding token on the child chain is required.
 */
export interface ChildTokenRequest {
  rootToken: FungibleToken;
}

/**
 * @typedef {Object} ChildTokenResponse
 * @property {Address} childToken - The address of the corresponding token on the child chain.
 */
export interface ChildTokenResponse {
  childToken: Address;
}

/**
 * @typedef {Object} RootTokenRequest
 * @property {Address} childToken - The token on the child chain for which the corresponding token on the root chain is required.
 */
export interface RootTokenRequest {
  childToken: Address;
}

/**
 * @typedef {Object} RootTokenResponse
 * @property {FungibleToken} rootToken - The corresponding token on the root chain.
 */
export interface RootTokenResponse {
  rootToken: FungibleToken;
}

/**
 * @typedef {Object} BridgeWithdrawRequest
 * @property {Address} recipientAddress - The address of the recipient of the withdrawn tokens on the root chain.
 * @property {FungibleToken} token - The token to be withdrawn.
 * @property {ethers.BigNumber} withdrawAmount - The amount of tokens to be withdrawn.
 */
export interface BridgeWithdrawRequest {
  recipientAddress: Address;
  token: FungibleToken;
  withdrawAmount: ethers.BigNumber;
}

/**
 * @typedef {Object} BridgeWithdrawResponse
 * @property {ethers.providers.TransactionRequest} unsignedTx - The unsigned withdrawal transaction.
 */
export interface BridgeWithdrawResponse {
  unsignedTx: ethers.providers.TransactionRequest;
}

/**
 * @typedef {Object} WaitForWithdrawalRequest
 * @property {string} transactionHash - The hash of the withdrawal transaction on the child chain.
 */
export interface WaitForWithdrawalRequest {
  transactionHash: string;
}

/**
 * @typedef {Object} WaitForWithdrawalResponse
 * Empty object signifies the successful completion of the withdrawal process.
 * If the withdrawal fails, an error will be thrown instead of a response.
 */
export interface WaitForWithdrawalResponse {}

/**
 * @typedef {Object} ExitRequest
 * @property {string} transactionHash - The hash of the withdraw transaction on the child chain
 */
export interface ExitRequest {
  transactionHash: string;
}

/**
 * @typedef {Object} ExitResponse
 * @property {ethers.providers.TransactionRequest} unsignedTx - The unsigned transaction that, when signed and broadcasted,
 * will perform the exit operation on the root chain.
 */
export interface ExitResponse {
  unsignedTx: ethers.providers.TransactionRequest;
}
