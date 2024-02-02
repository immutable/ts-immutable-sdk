import {
  ChainId, ChainName, Checkout, GasEstimateType, IMTBLWidgetEvents, WidgetTheme,
} from '@imtbl/checkout-sdk';
import {
  describe, it, cy,
} from 'local-cypress';
import { mount } from 'cypress/react18';
import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { Environment } from '@imtbl/config';
import { CryptoFiat } from '@imtbl/cryptofiat';
import { useTranslation } from 'react-i18next';
import WalletWidget from './WalletWidget';
import { cyIntercept, cySmartGet } from '../../lib/testUtils';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import {
  ConnectLoaderTestComponent,
} from '../../context/connect-loader-context/test-components/ConnectLoaderTestComponent';
import { ConnectionStatus } from '../../context/connect-loader-context/ConnectLoaderContext';
import { NATIVE } from '../../lib';

describe('WalletWidget tests', () => {
  const { t } = useTranslation();
  beforeEach(() => {
    cy.viewport('ipad-2');
    cyIntercept();
  });

  const mockProvider = {
    getSigner: () => ({
      getAddress: () => Promise.resolve('0xwalletAddress'),
    }),
  } as Web3Provider;

  const mockPassportProvider = {
    getSigner: () => ({
      getAddress: () => Promise.resolve('0xwalletAddress'),
    }),
    provider: { isPassport: true } as ExternalProvider,
  } as Web3Provider;

  const connectLoaderState = {
    checkout: new Checkout({
      baseConfig: { environment: Environment.SANDBOX },
    }),
    provider: mockProvider,
    connectionStatus: ConnectionStatus.CONNECTED_WITH_NETWORK,
  };

  describe('WalletWidget initialisation', () => {
    beforeEach(() => {
    });

    it('should show loading screen when component is mounted', () => {
      const widgetConfig = {
        theme: WidgetTheme.DARK,
        environment: Environment.SANDBOX,
        isBridgeEnabled: false,
        isSwapEnabled: false,
        isOnRampEnabled: false,
      } as StrongCheckoutWidgetsConfig;

      const balanceStub = cy
        .stub(Checkout.prototype, 'getBalance')
        .as('balanceNoNetworkStub');
      balanceStub.rejects({});
      const connectStub = cy
        .stub(Checkout.prototype, 'connect')
        .as('connectNoNetworkStub');
      connectStub.resolves({
        provider: mockProvider,
        network: { name: '' },
      });
      cy.stub(Checkout.prototype, 'getNetworkInfo')
        .as('getNetworkInfoStub')
        .resolves({
          chainId: ChainId.SEPOLIA,
          isSupported: true,
          nativeCurrency: {
            symbol: 'eth',
          },
        });

      mount(
        <ConnectLoaderTestComponent
          initialStateOverride={connectLoaderState}
        >
          <WalletWidget
            config={widgetConfig}
          />
        </ConnectLoaderTestComponent>,
      );

      cySmartGet('loading-view').should('be.visible');
      cySmartGet('wallet-balances').should('be.visible');
    });

    it('should show error view on error initialising and retry when try again pressed', () => {
      const widgetConfig = {
        theme: WidgetTheme.DARK,
        environment: Environment.SANDBOX,
        isBridgeEnabled: false,
        isSwapEnabled: false,
        isOnRampEnabled: false,
      } as StrongCheckoutWidgetsConfig;

      cyIntercept();

      const balanceStub = cy
        .stub(Checkout.prototype, 'getBalance')
        .as('balanceNoNetworkStub');
      balanceStub.rejects({});
      const connectStub = cy
        .stub(Checkout.prototype, 'connect')
        .as('connectNoNetworkStub');
      connectStub.resolves({
        provider: mockProvider,
        network: { name: '' },
      });
      cy.stub(Checkout.prototype, 'getNetworkInfo')
        .as('getNetworkInfoStub')
        .onFirstCall()
        .rejects({})
        .onSecondCall()
        .resolves({
          chainId: ChainId.SEPOLIA,
          isSupported: true,
          nativeCurrency: {
            symbol: 'eth',
          },
        });
      const isSwapAvailableStub = cy
        .stub(Checkout.prototype, 'isSwapAvailable')
        .as('isSwapAvailableStub');
      isSwapAvailableStub.resolves(true);

      mount(
        <ConnectLoaderTestComponent
          initialStateOverride={connectLoaderState}
        >
          <WalletWidget
            config={widgetConfig}
          />
        </ConnectLoaderTestComponent>,
      );

      cySmartGet('error-view').should('be.visible');
      cySmartGet('footer-button').click();
      cySmartGet('error-view').should('not.exist');
      cySmartGet('wallet-balances').should('be.visible');
    });
  });

  describe('Connected Wallet', () => {
    let getAllBalancesStub;
    beforeEach(() => {
      cy.stub(Checkout.prototype, 'connect')
        .as('connectStub')
        .onFirstCall()
        .resolves({
          provider: {
            getSigner: () => ({
              getAddress: () => Promise.resolve('dss'),
            }),
            getNetwork: async () => ({
              chainId: ChainId.ETHEREUM,
              name: 'Ethereum',
            }),
          },
          network: {
            chainId: ChainId.ETHEREUM,
            name: 'Ethereum',
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18,
            },
          },
        })
        .onSecondCall()
        .resolves({
          provider: {
            getSigner: () => ({
              getAddress: () => Promise.resolve('dss'),
            }),
            getNetwork: async () => ({
              chainId: ChainId.IMTBL_ZKEVM_TESTNET,
              name: ChainName.IMTBL_ZKEVM_TESTNET,
            }),
          },
          network: {
            chainId: ChainId.IMTBL_ZKEVM_TESTNET,
            name: ChainName.IMTBL_ZKEVM_TESTNET,
            nativeCurrency: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            },
          },
        });

      cy.stub(Checkout.prototype, 'getNetworkInfo')
        .as('getNetworkInfoStub')
        .resolves({
          chainId: ChainId.SEPOLIA,
          isSupported: true,
          nativeCurrency: {
            symbol: 'eth',
          },
        });

      cy.stub(Checkout.prototype, 'getNetworkAllowList')
        .as('getNetworkAllowListStub')
        .resolves({
          networks: [
            {
              name: 'Immutable zkEVM testnet',
              chainId: ChainId.IMTBL_ZKEVM_TESTNET,
            },
            {
              name: 'Sepolia',
              chainId: ChainId.SEPOLIA,
            },
          ],
        });

      getAllBalancesStub = cy
        .stub(Checkout.prototype, 'getAllBalances')
        .as('balanceStub');
      getAllBalancesStub.resolves({
        balances: [
          {
            balance: BigNumber.from(1),
            formattedBalance: '12.12',
            token: {
              name: 'Ether',
              symbol: 'ETH',
              decimals: 18,
            },
          },
          {
            balance: BigNumber.from(2),
            formattedBalance: '899',
            token: {
              name: 'Immutable X',
              symbol: 'IMX',
              decimals: 18,
            },
          },
          {
            balance: BigNumber.from(3),
            formattedBalance: '100.2',
            token: {
              name: 'Gods Unchained',
              symbol: 'GODS',
              decimals: 18,
            },
          },
        ],
      });

      cy.stub(Checkout.prototype, 'switchNetwork')
        .as('switchNetworkStub')
        .resolves({
          network: {
            chainId: ChainId.IMTBL_ZKEVM_TESTNET,
            name: 'Immutable zkEVM testnet',
            nativeCurrency: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
            },
          },
        });

      const signerStub = {
        getAddress: cy.stub().resolves('0x123'),
      };
      cy.stub(Web3Provider.prototype, 'getSigner').returns(signerStub);

      cy.stub(CryptoFiat.prototype, 'convert')
        .as('cryptoFiatStub')
        .resolves({
          eth: {
            usd: 1800,
          },
          imx: {
            usd: 0.7,
          },
          gods: {
            usd: 0.8,
          },
        });

      cy.stub(Checkout.prototype, 'gasEstimate')
        .as('gasEstimateStub')
        .resolves({
          gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
          gasFee: {
            estimatedAmount: BigNumber.from('10000000000000000'),
          },
        });
    });

    describe('WalletWidget balances', () => {
      it('should show the network and user balances on that network', () => {
        const widgetConfig = {
          theme: WidgetTheme.DARK,
          environment: Environment.SANDBOX,
          isBridgeEnabled: false,
          isSwapEnabled: false,
          isOnRampEnabled: false,
        } as StrongCheckoutWidgetsConfig;

        mount(
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <WalletWidget
              config={widgetConfig}
            />
            ,
          </ConnectLoaderTestComponent>,
        );

        cySmartGet('@balanceStub').should('have.been.called');

        cySmartGet('close-button').should('be.visible');
        cySmartGet('network-heading').should('be.visible');
        cySmartGet('Sepolia-network-button').should(
          'include.text',
          'Sepolia',
        );

        cySmartGet('total-token-balance').should('exist');
        cySmartGet('total-token-balance').should(
          'have.text',
          '≈ USD $22525.46',
        );

        cySmartGet('balance-item-ETH').should('exist');
        cySmartGet('balance-item-GODS').should('exist');
        cySmartGet('balance-item-IMX').should('exist');
      });

      it('should show the balance details for each token', () => {
        const widgetConfig = {
          theme: WidgetTheme.DARK,
          environment: Environment.SANDBOX,
          isBridgeEnabled: false,
          isSwapEnabled: false,
          isOnRampEnabled: false,
        } as StrongCheckoutWidgetsConfig;

        mount(
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <WalletWidget
              config={widgetConfig}
            />
            ,
          </ConnectLoaderTestComponent>,
        );

        cySmartGet('@balanceStub').should('have.been.called');

        cySmartGet('balance-item-ETH').should('exist');
        cySmartGet('balance-item-ETH').should('include.text', 'ETH');
        cySmartGet('balance-item-ETH').should('include.text', 'Ether');
        cySmartGet('balance-item-ETH__price').should('have.text', '12.12');

        cySmartGet('balance-item-IMX').should('exist');
        cySmartGet('balance-item-IMX').should('include.text', 'IMX');
        cySmartGet('balance-item-IMX').should('include.text', 'Immutable X');
        cySmartGet('balance-item-IMX__price').should('have.text', '899');

        cySmartGet('balance-item-GODS').should('exist');
        cySmartGet('balance-item-GODS').should('include.text', 'GODS');
        cySmartGet('balance-item-GODS').should(
          'include.text',
          'Gods Unchained',
        );
        cySmartGet('balance-item-GODS__price').should('have.text', '100.20');
      });

      it('should show error screen after getAllBalances unrecoverable failure', () => {
        const widgetConfig = {
          theme: WidgetTheme.DARK,
          environment: Environment.SANDBOX,
          isBridgeEnabled: false,
          isSwapEnabled: false,
          isOnRampEnabled: false,
        } as StrongCheckoutWidgetsConfig;

        getAllBalancesStub
          .onFirstCall()
          .rejects({ data: { code: 500 } })
          .onSecondCall()
          .resolves({
            balances: [
              {
                balance: BigNumber.from('10000000000000'),
                formattedBalance: '0.1',
                token: {
                  name: 'ImmutableX',
                  symbol: 'IMX',
                  decimals: 18,
                  address: NATIVE,
                  icon: '123',
                },
              },
            ],
          });

        mount(
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <WalletWidget
              config={widgetConfig}
            />
          </ConnectLoaderTestComponent>,
        );

        cySmartGet('error-view').should('be.visible');
        cySmartGet('footer-button').click();
        cySmartGet('error-view').should('not.exist');
        cySmartGet('wallet-balances').should('be.visible');
      });

      it('should show balances after getAllBalances failure', () => {
        getAllBalancesStub
          .rejects()
          .resolves({
            balances: [
              {
                balance: BigNumber.from('1000000000000000000'),
                formattedBalance: '0.1',
                token: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                  address: '',
                  icon: '123',
                },
              },
              {
                balance: BigNumber.from('10000000000000'),
                formattedBalance: '0.1',
                token: {
                  name: 'ImmutableX',
                  symbol: 'IMX',
                  decimals: 18,
                  address: NATIVE,
                  icon: '123',
                },
              },
            ],
          });

        const widgetConfig = {
          theme: WidgetTheme.DARK,
          environment: Environment.SANDBOX,
          isBridgeEnabled: false,
          isSwapEnabled: false,
          isOnRampEnabled: false,
        } as StrongCheckoutWidgetsConfig;

        mount(
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <WalletWidget
              config={widgetConfig}
            />
            ,
          </ConnectLoaderTestComponent>,
        );

        cySmartGet('balance-item-IMX').should('exist');
        cySmartGet('balance-item-ETH').should('exist');
      });
    });

    describe('WalletWidget settings', () => {
      it('should show the settings view if the settings button is clicked', () => {
        const widgetConfig = {
          theme: WidgetTheme.DARK,
          environment: Environment.SANDBOX,
          isBridgeEnabled: false,
          isSwapEnabled: false,
          isOnRampEnabled: false,
        } as StrongCheckoutWidgetsConfig;

        mount(
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <WalletWidget
              config={widgetConfig}
            />
            ,
          </ConnectLoaderTestComponent>,
        );

        cySmartGet('settings-button').click();
        cySmartGet('header-title').should('have.text', 'Settings');
        cySmartGet('close-button').should('be.visible');
        cySmartGet('back-button').should('be.visible');
      });

      it('should show correct wallet address on the settings page', () => {
        const widgetConfig = {
          theme: WidgetTheme.DARK,
          environment: Environment.SANDBOX,
          isBridgeEnabled: false,
          isSwapEnabled: false,
          isOnRampEnabled: false,
        } as StrongCheckoutWidgetsConfig;

        mount(
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <WalletWidget
              config={widgetConfig}
            />
            ,
          </ConnectLoaderTestComponent>,
        );
        cySmartGet('settings-button').click();
        cySmartGet('wallet-address').should('have.text', '0xwalletAddress');
      });

      it('should NOT show a disconnect button for Metamask users', () => {
        const widgetConfig = {
          theme: WidgetTheme.DARK,
          environment: Environment.SANDBOX,
          isBridgeEnabled: false,
          isSwapEnabled: false,
          isOnRampEnabled: false,
        } as StrongCheckoutWidgetsConfig;

        mount(
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <WalletWidget
              config={widgetConfig}
            />
            ,x
          </ConnectLoaderTestComponent>,
        );
        cySmartGet('settings-button').click();
        cySmartGet('disconnect-button').should(
          'not.exist',
        );
      });

      it('should show a disconnect button for Passport that fires the right event when clicked', () => {
        cy.window().then((window) => {
          window.addEventListener(
            IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
            cy.stub().as('disconnectEvent'),
          );
        });

        const widgetConfig = {
          theme: WidgetTheme.DARK,
          environment: Environment.SANDBOX,
          isBridgeEnabled: false,
          isSwapEnabled: false,
          isOnRampEnabled: false,
        } as StrongCheckoutWidgetsConfig;

        mount(
          <ConnectLoaderTestComponent
            initialStateOverride={
              {
                ...connectLoaderState,
                provider: mockPassportProvider,
              }
            }
          >
            <WalletWidget
              config={widgetConfig}
            />
          </ConnectLoaderTestComponent>,
        );
        cySmartGet('settings-button').click();
        cySmartGet('disconnect-button').should(
          'have.text',
          'Disconnect Wallet',
        );
        cySmartGet('disconnect-button').click();
        cySmartGet('@disconnectEvent').should('have.been.calledOnce');
      });
    });

    describe('WalletWidget coin info', () => {
      let signerStub;
      beforeEach(() => {
        signerStub = {
          getAddress: cy.stub().resolves('0x123'),
        };
      });
      it('should show the coin info view if the coin info icon is clicked', () => {
        const widgetConfig = {
          theme: WidgetTheme.DARK,
          environment: Environment.SANDBOX,
          isBridgeEnabled: false,
          isSwapEnabled: false,
          isOnRampEnabled: false,
        } as StrongCheckoutWidgetsConfig;

        mount(
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <WalletWidget
              config={widgetConfig}
            />
            ,
          </ConnectLoaderTestComponent>,
        );

        cySmartGet('coin-info-icon').click();
        cy.get('body').contains(t('views.COIN_INFO.metamask.body'));
        cy.get('body').contains(t('views.COIN_INFO.metamask.heading'));
        cySmartGet('back-button').should('be.visible');
      });

      it('should show the coin info view if the coin info icon is clicked and provider is passport', () => {
        const widgetConfig = {
          theme: WidgetTheme.DARK,
          environment: Environment.SANDBOX,
          isBridgeEnabled: false,
          isSwapEnabled: false,
          isOnRampEnabled: false,
        } as StrongCheckoutWidgetsConfig;
        const connectLoaderStateWithPassport = {
          ...connectLoaderState,
          provider: {
            provider: { isPassport: true } as ExternalProvider,
            getSigner: () => signerStub,
          } as any as Web3Provider,
        };
        mount(
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderStateWithPassport}
          >
            <WalletWidget
              config={widgetConfig}
            />
            ,
          </ConnectLoaderTestComponent>,
        );

        cySmartGet('coin-info-icon').click();
        cy.get('body').contains(t('views.COIN_INFO.passport.body1'));
        cy.get('body').contains(t('views.COIN_INFO.passport.body2'));
        cy.get('body').contains(t('views.COIN_INFO.passport.linkText'));
        cy.get('body').contains(t('views.COIN_INFO.passport.heading'));
        cySmartGet('back-button').should('be.visible');
      });
    });

    describe('Passport Wallet Widget', () => {
      const passportConnectLoaderState = {
        checkout: new Checkout({
          baseConfig: { environment: Environment.SANDBOX },
        }),
        provider: mockPassportProvider,
        connectionStatus: ConnectionStatus.CONNECTED_WITH_NETWORK,
      };

      it('should not show Network Menu when provider is passport', () => {
        const widgetConfig = {
          theme: WidgetTheme.DARK,
          environment: Environment.SANDBOX,
          isBridgeEnabled: false,
          isSwapEnabled: false,
          isOnRampEnabled: false,
        } as StrongCheckoutWidgetsConfig;

        mount(
          <ConnectLoaderTestComponent
            initialStateOverride={passportConnectLoaderState}
          >
            <WalletWidget
              config={widgetConfig}
            />
          </ConnectLoaderTestComponent>,
        );

        cySmartGet('wallet-balances').should('exist');
        cySmartGet('network-menu').should('not.exist');
      });
    });
  });
});
