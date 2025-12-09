import { Context, Config } from '@0xsequence/wallet-primitives';
import { State } from '@0xsequence/wallet-core';
import { Address, Hex } from 'ox';

export const SEQUENCE_CONTEXT: Context.Context = {
  factory: '0x1cf579D15a3fA90b144bc4E9016606781A7b3bCb',
  stage1: '0x2D2B49799985A9EABb3640b384FE082560b6D6B3',
  stage2: '0x592D6B6581B2808390CC08894C5249116B4DF162',
  creationCode: "0x6054600f3d396034805130553df3fe63906111273d3560e01c14602b57363d3d373d3d3d3d369030545af43d82803e156027573d90f35b3d90fd5b30543d5260203df3",
};

const immutableSignerContractAddress = '0x8bea3E180bEab544c9295a0C0b8eC1628614A2b3';

const stateProviderUrl = "https://keymachine.sequence.app";

export const createWalletConfig = (signerAddress: Address.Address): Config.Config => {
  const signers = [Address.from(immutableSignerContractAddress), signerAddress];

  if (signers[0].toLowerCase() > signers[1].toLowerCase()) {
    [signers[0], signers[1]] = [signers[1], signers[0]];
  }

  return {
    threshold: 2n,
    checkpoint: 0n,
    topology: [
      {
        type: "signer",
        address: signers[0],
        weight: 1n,
      },
      {
        type: "signer", 
        address: signers[1],
        weight: 1n,
      },
    ],
  };
};

export const createStateProvider = (walletAddress: Address.Address, deploymentSalt: string, realImageHash: Hex.Hex): State.Provider => {
  const baseStateProvider = new State.Sequence.Provider(stateProviderUrl);
  
  return new Proxy(baseStateProvider, {
    get(target, prop) {
      // Override getDeploy to return custom deployment info
      if (prop === 'getDeploy') {
        return async (wallet: Address.Address) => {
          if (wallet === walletAddress) {
            return {
              imageHash: deploymentSalt,
              context: SEQUENCE_CONTEXT,
            };
          }
          return target.getDeploy(wallet);
        };
      }
      
      // Override getConfiguration to map custom salt back to real imageHash
      if (prop === 'getConfiguration') {
        return async (queryImageHash: Hex.Hex) => {
          // If querying for custom salt, return config for real imageHash
          if (queryImageHash === deploymentSalt) {
            return target.getConfiguration(realImageHash);
          }
          return target.getConfiguration(queryImageHash);
        };
      }
      
      // Override getConfigurationUpdates to return empty array for custom salt wallets
      if (prop === 'getConfigurationUpdates') {
        return async (wallet: Address.Address, fromImageHash: Hex.Hex, options?: any) => {
          if (wallet === walletAddress) {
            return [];
          }
          return target.getConfigurationUpdates(wallet, fromImageHash, options);
        };
      }
      
      // Delegate all other methods to the base provider
      const value = (target as any)[prop];
      if (typeof value === 'function') {
        return value.bind(target);
      }
      return value;
    },
  }) as State.Provider;
};

export const saveWalletConfig = async (
  walletConfig: Config.Config,
  stateProvider: State.Provider
): Promise<void> => {
  await stateProvider.saveWallet(walletConfig, SEQUENCE_CONTEXT as any);
};

