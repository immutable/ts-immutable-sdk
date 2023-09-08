import { ModuleConfiguration } from '@imtbl/config';
import { ethers } from 'ethers';

export interface FactoryInstance {
  chainID: string;
  factory: Address;
}

export interface FactoryModuleConfiguration
  extends ModuleConfiguration<FactoryInstance> {
  factoryInstance: FactoryInstance;
  provider: ethers.providers.Provider;
}

export interface ParamInput {
  name: string;
  type: string;
}

export interface CreationABI {
  inputs: ParamInput[];
  stateMutability: string,
  type: string,
}

export interface Preset {
  name: string;
  group: string;
  description: string;
  link: string;
  creationABI: CreationABI;
}

/**
 * @typedef {string} Address - Represents an Ethereum address.
 */
export type Address = string;

export interface GetPresetsRequest {}

export interface GetPresetsResponse {
  presets: Preset[];
}

export interface GetUnsignedDeployPresetTxRequest {
  presetName: string;
  arguments: string[];
}

export interface GetUnsignedDeployPresetTxResponse {
  unsignedTx: ethers.providers.TransactionRequest;
}

export interface GetDeployDetailsRequest {
  receipt: ethers.providers.TransactionReceipt
}

export interface GetDeployDetailsResponse {
  deployedAddress: Address
}
