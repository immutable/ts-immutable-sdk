import { WalletConnectModal } from '@walletconnect/modal';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { ChainId, WidgetTheme } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';

export type WalletConnectConfiguration = {
  projectId: string;
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  }
};

const testnetModalChains = [`eip155:${ChainId.IMTBL_ZKEVM_TESTNET}`, `eip155:${ChainId.SEPOLIA}`];
const productionModalChains = [`eip155:${ChainId.IMTBL_ZKEVM_MAINNET}`, `eip155:${ChainId.ETHEREUM}`];

const darkThemeVariables = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '--wcm-accent-fill-color': '#F3F3F3',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '--wcm-background-color': '#131313',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '--wcm-container-border-radius': '8px',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '--wcm-wallet-icon-border-radius': '8px',
};

const lightThemeVariables = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '--wcm-accent-fill-color': '#131313',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '--wcm-background-color': '#F3F3F3',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '--wcm-container-border-radius': '8px',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '--wcm-wallet-icon-border-radius': '8px',
};

export class WalletConnectManager {
  private static instance: WalletConnectManager;

  private initialised: boolean = false;

  private environment!: Environment;

  private theme!: WidgetTheme;

  private walletConnectConfig!: WalletConnectConfiguration;

  private walletConnectModal!: WalletConnectModal;

  private ethereumProvider!: EthereumProvider;

  private validateConfig(config: WalletConnectConfiguration): boolean {
    if (!config.projectId || config.projectId === '') {
      // eslint-disable-next-line no-console
      console.warn('No wallet connect projectId');
      return false;
    }

    if (!config.metadata || !config.metadata.url || config.metadata.url === '') {
      // eslint-disable-next-line no-console
      console.warn('No WalletConnect metadata url');
      return false;
    }

    return true;
  }

  public static getInstance(): WalletConnectManager {
    if (!WalletConnectManager.instance) {
      WalletConnectManager.instance = new WalletConnectManager();
    }

    return WalletConnectManager.instance;
  }

  public initialise(environment: Environment, config: WalletConnectConfiguration, theme: WidgetTheme): void {
    if (!this.validateConfig(config)) {
      throw new Error('Incorrect Wallet Connect configuration');
    }
    this.walletConnectConfig = config;
    this.environment = environment;
    this.theme = theme;
    this.initialised = true;
  }

  public get isInitialised() {
    return this.initialised;
  }

  public getModal(): WalletConnectModal {
    if (!this.walletConnectConfig) {
      throw new Error('No WalletConnect config supplied');
    }
    if (!this.walletConnectModal) {
      const modal = new WalletConnectModal({
        projectId: this.walletConnectConfig.projectId,
        chains: this.environment === Environment.PRODUCTION ? productionModalChains : testnetModalChains,
        explorerRecommendedWalletIds: [
          'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
          '85db431492aa2e8672e93f4ea7acf10c88b97b867b0d373107af63dc4880f041', // Frontier
          // 'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom
          // '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
        ],
        explorerExcludedWalletIds: 'ALL',
        themeMode: this.theme,
        themeVariables: this.theme === WidgetTheme.DARK ? darkThemeVariables : lightThemeVariables,
      });
      this.walletConnectModal = modal;
    }

    return this.walletConnectModal;
  }

  public async getProvider(): Promise<EthereumProvider> {
    if (!this.walletConnectConfig) {
      throw new Error('No WalletConnect config supplied');
    }
    return new Promise((resolve) => {
      if (!this.ethereumProvider) {
        EthereumProvider.init({
          projectId: this.walletConnectConfig.projectId,
          chains: this.environment === Environment.PRODUCTION
            ? [ChainId.IMTBL_ZKEVM_MAINNET]
            : [ChainId.IMTBL_ZKEVM_TESTNET],
          optionalChains: this.environment === Environment.PRODUCTION
            ? [ChainId.ETHEREUM]
            : [ChainId.SEPOLIA],
          showQrModal: false,
          metadata: this.walletConnectConfig.metadata,
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
            themeMode: this.theme,
          },
          rpcMap: {
            [ChainId.ETHEREUM]: 'https://checkout-api.immutable.com/v1/rpc/eth-mainnet',
            [ChainId.IMTBL_ZKEVM_MAINNET]: 'https://rpc.immutable.com',
            [ChainId.SEPOLIA]: 'https://checkout-api.sandbox.immutable.com/v1/rpc/eth-sepolia',
            [ChainId.IMTBL_ZKEVM_TESTNET]: 'https://rpc.testnet.immutable.com',
          },
        }).then((wcEthereumProvider: EthereumProvider) => {
          this.ethereumProvider = wcEthereumProvider;
          resolve(this.ethereumProvider);
        });
      } else {
        resolve(this.ethereumProvider);
      }
    });
  }
}
