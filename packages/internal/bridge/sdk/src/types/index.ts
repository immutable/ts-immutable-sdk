import { ModuleConfiguration } from '@imtbl/config';

export type BridgeInstance = {
  rootChainID: string;
  childChainID: string;
};

export interface BridgeOverrides {
  bridgeContracts: BridgeContracts;
}

export type BridgeContracts = {
  rootChainERC20Predicate: string;
  rootChainStateSender: string;
  childChainERC20Predicate: string;
  childChainStateReceiver: string;
};

export interface BridgeModuleConfiguration
  extends ModuleConfiguration<BridgeOverrides> {
  bridgeInstance: BridgeInstance;
}
