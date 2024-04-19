import { WalletConnectModal } from '@walletconnect/modal';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { ChainId, EIP6963ProviderInfo, WidgetTheme } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';

export const walletConnectProviderInfo = {
  name: 'Other',
  rdns: 'walletconnect',
  // eslint-disable-next-line max-len
  icon: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNDggNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGc+PHBhdGggZD0iTTEwLjQyMzYgMTQuODY4NkMxNy45NTA3IDcuNTIzNzcgMzAuMTY5NCA3LjUyMzc3IDM3LjY5NjQgMTQuODY4NkwzOC42MDI2IDE1Ljc1OTNDMzguOTgyNiAxNi4xMjQ0IDM4Ljk4MjYgMTYuNzIzMSAzOC42MDI2IDE3LjA4ODFMMzUuNTA0MSAyMC4xMTA4QzM1LjMxNDEgMjAuMzAwNiAzNS4wMDcxIDIwLjMwMDYgMzQuODE3MSAyMC4xMTA4TDMzLjU3NDggMTguODk4OEMyOC4zMTMyIDEzLjc3MzUgMTkuODA2OSAxMy43NzM1IDE0LjU0NTIgMTguODk4OEwxMy4yMTUyIDIwLjE5ODRDMTMuMDI1MiAyMC4zODgyIDEyLjcxODMgMjAuMzg4MiAxMi41MjgzIDIwLjE5ODRMOS40Mjk3OCAxNy4xNzU3QzkuMDQ5NzcgMTYuODEwNyA5LjA0OTc3IDE2LjIxMiA5LjQyOTc4IDE1Ljg0N0wxMC40MjM2IDE0Ljg2ODZaTTQ0LjExMjcgMjEuMTE4M0w0Ni44NzUgMjMuODA1MUM0Ny4yNTUgMjQuMTcwMSA0Ny4yNTUgMjQuNzY4OCA0Ni44NzUgMjUuMTMzOUwzNC40MzcxIDM3LjI2ODJDMzQuMDU3MSAzNy42MzMyIDMzLjQ0MzMgMzcuNjMzMiAzMy4wNzc5IDM3LjI2ODJMMjQuMjUgMjguNjUzQzI0LjE2MjMgMjguNTY1NCAyNC4wMDE2IDI4LjU2NTQgMjMuOTEzOSAyOC42NTNMMTUuMDg2IDM3LjI2ODJDMTQuNzA2IDM3LjYzMzIgMTQuMDkyMiAzNy42MzMyIDEzLjcyNjggMzcuMjY4MkwxLjI0NTAzIDI1LjEzMzlDMC44NjUwMiAyNC43Njg4IDAuODY1MDIgMjQuMTcwMSAxLjI0NTAzIDIzLjgwNTFMNC4wMDczOCAyMS4xMTgzQzQuMzg3MzkgMjAuNzUzMyA1LjAwMTI1IDIwLjc1MzMgNS4zNjY2NCAyMS4xMTgzTDE0LjE5NDUgMjkuNzMzNUMxNC4yODIyIDI5LjgyMTEgMTQuNDQyOSAyOS44MjExIDE0LjUzMDYgMjkuNzMzNUwyMy4zNTg1IDIxLjExODNDMjMuNzM4NSAyMC43NTMzIDI0LjM1MjMgMjAuNzUzMyAyNC43MTc3IDIxLjExODNMMzMuNTQ1NiAyOS43MzM1QzMzLjYzMzMgMjkuODIxMSAzMy43OTQgMjkuODIxMSAzMy44ODE3IDI5LjczMzVMNDIuNzA5NiAyMS4xMTgzQzQzLjExODggMjAuNzUzMyA0My43MzI3IDIwLjc1MzMgNDQuMTEyNyAyMS4xMTgzWiIgZmlsbD0iIzM2OEFGQSI+PC9wYXRoPjwvZz48L3N2Zz4=',
  uuid: 'wallet-connect',
} as EIP6963ProviderInfo;

export type WalletConnectConfiguration = {
  projectId: string;
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  }
};

type ConnectConfig = {
  walletConnect: boolean;
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
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '--wcm-overlay-background-color': 'rgba(255, 255, 255, 0.1)',
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
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '--wcm-overlay-background-color': 'rgba(255, 255, 255, 0.1)',
};

// Whitelisted wallet ids on WalletConnect explorer API
const metamaskId = 'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96';
const frontierId = '85db431492aa2e8672e93f4ea7acf10c88b97b867b0d373107af63dc4880f041';
const ledgerLiveId = '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927';
// const coinbaseId = 'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa';
// const phantomId = 'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393';
// const rainbowId = '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369';

const productionWalletWhitelist = [metamaskId, frontierId, ledgerLiveId];
const sandboxWalletWhitelist = [metamaskId];

export class WalletConnectManager {
  private static instance: WalletConnectManager;

  private isInitialising: boolean = false;

  private initialised: boolean = false;

  private enabled: boolean = false;

  private environment!: Environment;

  private theme!: WidgetTheme;

  private walletConnectConfig!: WalletConnectConfiguration;

  private walletConnectModal!: WalletConnectModal;

  private ethereumProvider!: EthereumProvider;

  private walletListings!: any;

  private providerQueue: any[] = [];

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

  public initialise(
    environment: Environment,
    config: WalletConnectConfiguration,
    theme: WidgetTheme,
    remoteConfig: Promise<ConnectConfig>,
  ): void {
    if (!this.validateConfig(config)) {
      throw new Error('Incorrect Wallet Connect configuration');
    }
    this.walletConnectConfig = config;
    this.environment = environment;
    this.theme = theme;
    this.initialised = true;

    // Determine if WalletConnect feature flag is enabled
    remoteConfig?.then((loadedConfig) => {
      this.enabled = loadedConfig.walletConnect;
    });
  }

  public get isInitialised() {
    return this.initialised;
  }

  public get isEnabled() {
    return this.enabled;
  }

  public getModal(): WalletConnectModal {
    if (!this.walletConnectConfig) {
      throw new Error('No WalletConnect config supplied');
    }
    if (!this.walletConnectModal) {
      const modal = new WalletConnectModal({
        projectId: this.walletConnectConfig.projectId,
        chains: this.environment === Environment.PRODUCTION ? productionModalChains : testnetModalChains,
        explorerRecommendedWalletIds: this.environment === Environment.PRODUCTION
          ? productionWalletWhitelist : sandboxWalletWhitelist,
        explorerExcludedWalletIds: [],
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
        if (this.isInitialising) {
          this.providerQueue.push(resolve);
        } else {
          this.isInitialising = true;
          EthereumProvider.init({
            projectId: this.walletConnectConfig.projectId,
            chains: this.environment === Environment.PRODUCTION
              ? [ChainId.ETHEREUM]
              : [ChainId.SEPOLIA],
            optionalChains: this.environment === Environment.PRODUCTION
              ? [ChainId.IMTBL_ZKEVM_MAINNET, ChainId.ETHEREUM]
              : [ChainId.IMTBL_ZKEVM_TESTNET, ChainId.SEPOLIA],
            showQrModal: false,
            metadata: this.walletConnectConfig.metadata,
            qrModalOptions: {
              themeMode: this.theme,
            },
            rpcMap: {
              [ChainId.ETHEREUM]: 'https://checkout-api.immutable.com/v1/rpc/eth-mainnet',
              [ChainId.IMTBL_ZKEVM_MAINNET]: 'https://rpc.immutable.com',
              [ChainId.SEPOLIA]: 'https://checkout-api.sandbox.immutable.com/v1/rpc/eth-sepolia',
              [ChainId.IMTBL_ZKEVM_TESTNET]: 'https://rpc.testnet.immutable.com',
            },
          })
            .then((wcEthereumProvider: EthereumProvider) => {
              this.ethereumProvider = wcEthereumProvider;
              resolve(this.ethereumProvider);

              // Resolve anything in the provider queue
              this.isInitialising = false;
              this.providerQueue.forEach((resolveFn) => {
                resolveFn(this.ethereumProvider);
              });
            });
        }
      } else {
        resolve(this.ethereumProvider);
      }
    });
  }

  private async loadWalletListings(): Promise<Response | undefined> {
    const whitelistedWallets = this.environment === Environment.PRODUCTION
      ? productionWalletWhitelist : sandboxWalletWhitelist;

    const whitelistedWalletIds = whitelistedWallets.map((walletId) => `${walletId}`).join(',');
    // eslint-disable-next-line max-len
    const walletListingsApi = `https://explorer-api.walletconnect.com/v3/wallets?projectId=${this.walletConnectConfig.projectId}&ids=${whitelistedWalletIds}`;

    try {
      const response = await fetch(walletListingsApi);
      const data = await response.json();
      return data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching wallet listings', error);
    }
    return undefined;
  }

  public async getWalletLogoUrl(walletSlug?: string): Promise<string | undefined> {
    if (!this.walletListings) {
      this.walletListings = await this.loadWalletListings();
    }
    const walletName = walletSlug || this.ethereumProvider?.session?.peer.metadata.name;
    if (!this.walletListings || !walletName) {
      return undefined;
    }

    const matchedWallet = Object.values(this.walletListings.listings)
      .find((wallet: any) => walletName.toLowerCase().includes(wallet.slug)) as any;
    return matchedWallet?.image_url.md;
  }
}
