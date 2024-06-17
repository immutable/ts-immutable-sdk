import { FactoryInstance } from '../types';

export const ZKEVM_DEVNET_CHAIN_ID = '13473';
export const ZKEVM_DEVNET_FACTORY_ADDRESS = '0xTODO';

export const ZKEVM_TESTNET_CHAIN_ID = '13473';
export const ZKEVM_TESTNET_FACTORY_ADDRESS = '0xTODO';

export const ZKEVM_MAINNET_CHAIN_ID = '13371';
export const ZKEVM_MAINNET_FACTORY_ADDRESS = '0xTODO';

export const ZKEVM_DEVNET: FactoryInstance = {
  chainID: ZKEVM_DEVNET_CHAIN_ID,
  factory: ZKEVM_DEVNET_FACTORY_ADDRESS,
};

export const ZKEVM_TESTNET: FactoryInstance = {
  chainID: ZKEVM_TESTNET_CHAIN_ID,
  factory: ZKEVM_TESTNET_FACTORY_ADDRESS,
};

export const ZKEVM_MAINNET: FactoryInstance = {
  chainID: ZKEVM_MAINNET_CHAIN_ID,
  factory: ZKEVM_MAINNET_FACTORY_ADDRESS,
};
