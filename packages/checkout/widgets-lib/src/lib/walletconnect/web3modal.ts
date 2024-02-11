import {
  ChainId, ChainName, CreateProviderResult, WalletProviderName,
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { Web3Provider } from '@ethersproject/providers';
import { CHECKOUT_CDN_BASE_URL } from 'lib/constants';
import { Web3Modal } from 'context/web3modal-context/web3ModalTypes';

const SEPOLIA_RPC_URL = 'https://checkout-api.sandbox.immutable.com/v1/rpc/eth-sepolia';
const IMMUTABLE_ZKEVM_TESTNET_RPC_URL = 'https://rpc.testnet.immutable.com';
const ETHEREUM_RPC_URL = 'https://checkout-api.immutable.com/v1/rpc/eth-mainnet';
const IMMUTABLE_ZKEVM_RPC_URL = 'https://rpc.immutable.com';

export const WALLET_CONNECT_ETHEREUM = {
  chainId: ChainId.ETHEREUM,
  name: ChainName.ETHEREUM,
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io/',
  rpcUrl: ETHEREUM_RPC_URL,
};

export const WALLET_CONNECT_SEPOLIA = {
  chainId: ChainId.SEPOLIA,
  name: ChainName.SEPOLIA,
  currency: 'SepoliaETH',
  explorerUrl: 'https://sepolia.etherscan.io/',
  rpcUrl: SEPOLIA_RPC_URL,
};

export const WALLET_CONNECT_IMTBL_ZKEVM_MAINNET = {
  chainId: ChainId.IMTBL_ZKEVM_MAINNET,
  name: ChainName.IMTBL_ZKEVM_MAINNET,
  currency: 'IMX',
  explorerUrl: 'https://explorer.immutable.com',
  rpcUrl: IMMUTABLE_ZKEVM_RPC_URL,
};

export const WALLET_CONNECT_IMTBL_ZKEVM_TESTNET = {
  chainId: ChainId.IMTBL_ZKEVM_TESTNET,
  name: ChainName.IMTBL_ZKEVM_TESTNET,
  currency: 'tIMX',
  explorerUrl: 'https://explorer.testnet.immutable.com',
  rpcUrl: IMMUTABLE_ZKEVM_TESTNET_RPC_URL,
};

export const WALLET_CONNECT_METADATA = {
  name: 'Immutable Checkout',
  description: 'Immutable Checkout',
  url: 'https://toolkit.immutable.com',
  icons: [`${CHECKOUT_CDN_BASE_URL[Environment.PRODUCTION]}/v1/blob/img/tokens/imx.svg`],
};

export const WALLET_CONNECT_PROJECT_ID = '938b553484e344b1e0b4bb80edf8c362';

export function getWalletConnectChainsByEnvironment(environment: Environment): any[] {
  if (environment === Environment.PRODUCTION) {
    return [WALLET_CONNECT_ETHEREUM, WALLET_CONNECT_IMTBL_ZKEVM_MAINNET];
  }
  return [WALLET_CONNECT_SEPOLIA, WALLET_CONNECT_IMTBL_ZKEVM_TESTNET];
}

export const getWalletConnectProvider = async (
  web3Modal: Web3Modal,
  changeAccount = false,
): Promise<CreateProviderResult> => {
  console.log('web3Modal', web3Modal);
  if (!changeAccount) {
    const walletConnectProvider = web3Modal.getWalletProvider();
    const isConnected = web3Modal.getIsConnected();
    console.log('walletConnectProvider', walletConnectProvider);
    console.log('isConnected', isConnected);

    if (isConnected && walletConnectProvider) {
      return {
        provider: new Web3Provider(walletConnectProvider),
        walletProviderName: WalletProviderName.WALLET_CONNECT,
      };
    }
  }

  const getProvider = () => new Promise<CreateProviderResult>((resolve, reject) => {
    web3Modal!.subscribeProvider((newState) => {
      console.log('newState', newState);
      if (newState.provider) {
        const provider = new Web3Provider(newState.provider);
        resolve({
          provider,
          walletProviderName: WalletProviderName.WALLET_CONNECT,
        });
      } else {
        web3Modal.disconnect().then(() => web3Modal.close());
        reject(new Error('Failed to create WalletConnect provider'));
      }
    });

    web3Modal!.open({ view: 'Connect' });
  });

  return getProvider();
};
