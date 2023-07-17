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
 * @typedef {Object} BridgeDepositRequest
 * @property {Address} depositorAddress - The address of the depositor.
 * @property {Address} recipientAddress - The address of the recipient.
 * @property {FungibleToken} token - The token to be deposited.
 * @property {ethers.BigNumber} depositAmount - The amount to be deposited.
 */
export interface BridgeDepositRequest {
  depositorAddress: Address;
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

export interface BridgeWithdrawRequest {
  recipientAddress: Address;
  token: FungibleToken;
  withdrawAmount: ethers.BigNumber;
}

export interface BridgeWithdrawResponse {
  unsignedTx: ethers.providers.TransactionRequest;
}

/**
 * @typedef {Object} ApproveBridgeRequest
 * @property {string} depositorAddress - The address of the depositor.
 * @property {FungibleToken} token - The token to be approved.
 * @property {ethers.BigNumber} depositAmount - The amount to be approved for deposit.
 */
export interface ApproveBridgeRequest {
  depositorAddress: string;
  token: FungibleToken;
  depositAmount: ethers.BigNumber;
}

/**
 * @typedef {Object} ApproveBridgeResponse
 * @property {ethers.providers.TransactionRequest | null} unsignedTx - The unsigned transaction for the token approval, or null if no approval is required.
 * @property {boolean} required - Indicates whether an approval transaction is required or not.
 */
export interface ApproveBridgeResponse {
  unsignedTx: ethers.providers.TransactionRequest | null;
  required: boolean;
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
 * @typedef {Object} WaitForDepositRequest
 * @property {string} transactionHash - The hash of the deposit transaction on the root chain.
 */
export interface WaitForDepositRequest {
  transactionHash: string;
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
 * @property {CompletionStatus} status - The status of the deposit transaction after waiting.
 */
export interface WaitForWithdrawalResponse {
  status: CompletionStatus;
}

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
 * @typedef {Object} WaitForDepositResponse
 * @property {CompletionStatus} status - The status of the deposit transaction after waiting.
 */
export interface WaitForDepositResponse {
  status: CompletionStatus;
}
