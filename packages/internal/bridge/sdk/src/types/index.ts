import { ModuleConfiguration } from '@imtbl/config';
import { BridgeError } from 'errors';
import { ethers } from 'ethers';

export type BridgeInstance = {
  rootChainID: string;
  childChainID: string;
};

export interface BridgeOverrides {
  bridgeContracts: BridgeContracts;
}

export type BridgeContracts = {
  rootChainERC20Predicate: Address;
  rootChainStateSender: Address;
  childChainERC20Predicate: Address;
  childChainStateReceiver: Address;
};

export interface BridgeModuleConfiguration
  extends ModuleConfiguration<BridgeOverrides> {
  bridgeInstance: BridgeInstance;
  rootProvider: ethers.providers.Provider;
  childProvider: ethers.providers.Provider;
}

export type Address = string;

export type FungibleToken = Address | 'NATIVE';

export interface BridgeDepositRequest {
  depositorAddress: Address;
  recipientAddress: Address;
  token: FungibleToken;
  depositAmount: ethers.BigNumber;
}

export interface BridgeDepositResponse {
  unsignedTx: ethers.providers.TransactionRequest;
}

export interface ApproveBridgeRequest {
  depositorAddress: string;
  token: FungibleToken;
  depositAmount: ethers.BigNumber;
}

export interface ApproveBridgeResponse {
  unsignedTx: ethers.providers.TransactionRequest | null;
  required: boolean;
}

export interface BridgeFeeRequest {
  token: FungibleToken;
}

export interface BridgeFeeResponse {
  bridgeable: boolean;
  feeAmount: ethers.BigNumber;
}

export interface WaitForRequest {
  transactionHash: string;
}

export enum CompletionStatus {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
}

export interface WaitForResponse {
  status: CompletionStatus;
  error: BridgeError | null;
}
