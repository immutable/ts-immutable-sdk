import {
  ChainId, ChainName, Checkout, CreateProviderResult, WalletProviderName,
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5';
import { getL1ChainId } from 'lib/networkUtils';
import { Web3Provider } from '@ethersproject/providers';
import { CHECKOUT_CDN_BASE_URL } from 'lib/constants';

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

function getWalletConnectChainsByEnvironment(environment: Environment): any[] {
  if (environment === Environment.PRODUCTION) {
    return [WALLET_CONNECT_ETHEREUM, WALLET_CONNECT_IMTBL_ZKEVM_MAINNET];
  }
  return [WALLET_CONNECT_SEPOLIA, WALLET_CONNECT_IMTBL_ZKEVM_TESTNET];
}

// function getWeb3Modal(checkout:Checkout) {
//   return createWeb3Modal({
//     ethersConfig: defaultConfig({
//       metadata: WALLET_CONNECT_METADATA,
//       defaultChainId: getL1ChainId(checkout.config),
//       enableEIP6963: false,
//       enableInjected: false,
//       enableCoinbase: false,
//     }),
//     chains: getWalletConnectChainsByEnvironment(checkout.config.environment),
//     enableAnalytics: true, // Optional - true by default
//     projectId: WALLET_CONNECT_PROJECT_ID,
//     featuredWalletIds: [
//       'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // metamask mobile
//     ],
//     includeWalletIds: ['c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'],
//     excludeWalletIds: ['ALL'],
//   });
// }

export const getWalletConnectProvider = async (
  checkout: Checkout,
  changeAccount = false,
): Promise<CreateProviderResult> => {
  const modal = createWeb3Modal({
    ethersConfig: defaultConfig({
      metadata: WALLET_CONNECT_METADATA,
      defaultChainId: getL1ChainId(checkout.config),
      enableEIP6963: false,
      enableInjected: false,
      enableCoinbase: false,
    }),
    chains: getWalletConnectChainsByEnvironment(checkout.config.environment),
    enableAnalytics: true, // Optional - true by default
    projectId: WALLET_CONNECT_PROJECT_ID,
    featuredWalletIds: [
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // metamask mobile
    ],
    includeWalletIds: ['c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96'],
    excludeWalletIds: ['ALL'],
  });

  if (!changeAccount) {
    const walletConnectProvider = modal.getWalletProvider();
    const isConnected = modal.getIsConnected();
    console.log('walletConnectProvider', walletConnectProvider);
    console.log('isConnected', isConnected);

    if (isConnected && walletConnectProvider) {
      return {
        provider: new Web3Provider(walletConnectProvider),
        walletProviderName: WalletProviderName.WALLET_CONNECT,
      };
    }
  }

  if (modal && typeof modal.disconnect !== 'undefined') {
    modal.disconnect();
  }

  const getProvider = () => new Promise<CreateProviderResult>((resolve, reject) => {
    modal!.subscribeProvider((newState) => {
      console.log('newState', newState);
      if (newState.provider) {
        const provider = new Web3Provider(newState.provider);
        resolve({
          provider,
          walletProviderName: WalletProviderName.WALLET_CONNECT,
        });
      }
      reject(new Error('Failed to create WalletCOnnect provider'));
    });

    console.log('opening modal');
    modal!.open();
  });

  return getProvider();
};
