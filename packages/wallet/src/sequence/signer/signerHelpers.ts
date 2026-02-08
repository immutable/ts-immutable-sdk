import { Context, Config } from '@0xsequence/wallet-primitives';
import { State } from '@0xsequence/wallet-core';
import { Address, Hex } from 'ox';

export const SEQUENCE_CONTEXT: Context.Context = {
  factory: '0x8Fa5088dF65855E0DaF87FA6591659893b24871d',
  stage1: '0xF8dF2f50e69F1cC8aCf8B4d1fE49c797788f2F0B',
  stage2: '0xE93EFAfcd9944F4644Cbd4455E6C2089409CfB44',
  creationCode: "0x6054600f3d396034805130553df3fe63906111273d3560e01c14602b57363d3d373d3d3d3d369030545af43d82803e156027573d90f35b3d90fd5b30543d5260203df3",
};

const immutableSignerContractAddress = '0xcff469E561D9dCe5B1185CD2AC1Fa961F8fbDe61';

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

