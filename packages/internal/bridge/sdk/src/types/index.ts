import { ModuleConfiguration } from '@imtbl/config';
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
