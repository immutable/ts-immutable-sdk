import { WalletConnectModal } from '@walletconnect/modal';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { ChainId } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { addProviderListenersForWidgetRoot } from './eip1193Events';

export class WalletConnectManager {
  private static instance: WalletConnectManager;

  private walletConnectModal!: WalletConnectModal;

  private ethereumProvider!: EthereumProvider;

  public displayUri!: string;

  // private constructor() {
  // }

  public static getInstance(): WalletConnectManager {
    if (!WalletConnectManager.instance) {
      WalletConnectManager.instance = new WalletConnectManager();
    }

    return WalletConnectManager.instance;
  }

  public getModal(): WalletConnectModal {
    if (!this.walletConnectModal) {
      const modal = new WalletConnectModal({
        projectId: '938b553484e344b1e0b4bb80edf8c362',
        // chains: [`eip155:${ChainId.ETHEREUM.toString()}`, `eip155:${ChainId.IMTBL_ZKEVM_MAINNET}`],
        chains: [`eip155:${ChainId.IMTBL_ZKEVM_TESTNET}`, `eip155:${ChainId.SEPOLIA.toString()}`],
        explorerRecommendedWalletIds: [
          'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
          '85db431492aa2e8672e93f4ea7acf10c88b97b867b0d373107af63dc4880f041', // Frontier
          'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
          '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
        ],
        explorerExcludedWalletIds: 'ALL',
      });
      this.walletConnectModal = modal;
    }

    return this.walletConnectModal;
  }

  public async getProvider(): Promise<EthereumProvider> {
    return new Promise((resolve) => {
      if (!this.ethereumProvider) {
        EthereumProvider.init({
          projectId: '938b553484e344b1e0b4bb80edf8c362',
          chains: [ChainId.IMTBL_ZKEVM_TESTNET],
          // optionalChains: [ChainId.IMTBL_ZKEVM_TESTNET], // ChainId.SEPOLIA
          // chains: [ChainId.ETHEREUM],
          // optionalChains: [ChainId.IMTBL_ZKEVM_MAINNET],
          showQrModal: false,
          metadata: {
            name: 'Immutable Checkout',
            description: 'Immutable Checkout',
            // url: 'https://toolkit.immutable.com',
            url: 'https://checkout-playground.sandbox.immutable.com',
            icons: [],
          },
          methods: [
            'eth_sendTransaction',
            'personal_sign',
          ],
          optionalMethods: [
            'eth_accounts',
            'eth_requestAccounts',
            'eth_sendRawTransaction',
            'eth_sign',
            'eth_signTransaction',
            'eth_signTypedData',
            'eth_signTypedData_v3',
            'eth_signTypedData_v4',
            'eth_sendTransaction',
            'personal_sign',
            'wallet_switchEthereumChain',
            'wallet_addEthereumChain',
            'wallet_getPermissions',
            'wallet_requestPermissions',
            'wallet_registerOnboarding',
            'wallet_watchAsset',
            'wallet_scanQRCode',
          ],
          qrModalOptions: {
            themeMode: 'dark',
          },
          rpcMap: {
            [ChainId.ETHEREUM]: 'https://checkout-api.immutable.com/v1/rpc/eth-mainnet',
            [ChainId.IMTBL_ZKEVM_MAINNET]: 'https://rpc.immutable.com',
            [ChainId.SEPOLIA]: 'https://checkout-api.sandbox.immutable.com/v1/rpc/eth-sepolia',
            [ChainId.IMTBL_ZKEVM_TESTNET]: 'https://rpc.testnet.immutable.com',
          },
        }).then((wcEthereumProvider: EthereumProvider) => {
          // eslint-disable-next-line no-console
          console.log('wcEthereumProvider', wcEthereumProvider);
          // wcEthereumProvider.on('display_uri', (data) => {
          //   // eslint-disable-next-line no-console
          //   console.log('wc display_uri', data);
          //   // setWcDisplayURI(data);
          //   this.displayUri = data;
          //   const pairingTopic = data.split('@')[0].replace('wc:', '');
          //   // eslint-disable-next-line no-console
          //   console.log('pairingTopic', pairingTopic);
          //   // setWcPairingTopic(pairingTopic);
          // });
          // wcEthereumProvider.on('connect', (data) => {
          //   // eslint-disable-next-line no-console
          //   console.log('wc connect', data);
          //   // modal.closeModal();
          // });
          wcEthereumProvider.on('disconnect', (data) => {
            // eslint-disable-next-line no-console
            console.log('wc disconnect', data);
          });
          // wcEthereumProvider.on('accountsChanged', (data) => {
          //   // eslint-disable-next-line no-console
          //   console.log('wc accountsChanged', data);
          // });
          // wcEthereumProvider.on('chainChanged', (data) => {
          //   // eslint-disable-next-line no-console
          //   console.log('wc chainChanged', data);
          // });
          wcEthereumProvider.on('session_update', (data) => {
            // eslint-disable-next-line no-console
            console.log('wc session_update', data);
            // setWcSessionUpdateEvent(data);
            // setWcSessionTopic(data?.topic);
          });
          wcEthereumProvider.on('session_event', (data) => {
            // eslint-disable-next-line no-console
            console.log('wc session_event', data);
            // setWcSessionEvent(data);
            // setWcSessionTopic(data?.topic);
          });
          wcEthereumProvider.on('session_delete', (data) => {
            // eslint-disable-next-line no-console
            console.log('wc session_delete', data);
          });
          wcEthereumProvider.on('message', (data) => {
            // eslint-disable-next-line no-console
            console.log('wc message', data);
          });

          addProviderListenersForWidgetRoot({ provider: wcEthereumProvider } as unknown as Web3Provider);
          this.ethereumProvider = wcEthereumProvider;
          resolve(this.ethereumProvider);
        });
      } else {
        resolve(this.ethereumProvider);
      }
    });
  }
}
