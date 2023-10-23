import {
  Checkout, WalletProviderName, TokenInfo, ChainId, ChainName, GasEstimateType,
} from '@imtbl/checkout-sdk';
import { describe, it, cy } from 'local-cypress';
import { mount } from 'cypress/react18';
import { BiomeCombinedProviders } from '@biom3/react';
import { BigNumber } from 'ethers';
import { IMTBLWidgetEvents } from '@imtbl/checkout-widgets';
import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { WalletBalances } from './WalletBalances';
import { WalletContext, WalletState } from '../context/WalletContext';
import { cyIntercept, cySmartGet } from '../../../lib/testUtils';
import { WalletWidgetTestComponent } from '../test-components/WalletWidgetTestComponent';
import { orchestrationEvents } from '../../../lib/orchestrationEvents';
import { ConnectionStatus } from '../../../context/connect-loader-context/ConnectLoaderContext';
import {
  ConnectLoaderTestComponent,
} from '../../../context/connect-loader-context/test-components/ConnectLoaderTestComponent';
import { IMX_ADDRESS_ZKEVM } from '../../../lib';
import { CustomAnalyticsProvider } from '../../../context/analytics-provider/CustomAnalyticsProvider';
import { StrongCheckoutWidgetsConfig } from '../../../lib/withDefaultWidgetConfig';

describe('WalletBalances', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
    cyIntercept();
  });

  const connectLoaderState = {
    checkout: new Checkout({
      baseConfig: { environment: Environment.SANDBOX },
    }),
    provider: {
      getSigner: () => ({
        getAddress: async () => Promise.resolve(''),
      }),
      getNetwork: async () => ({
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        name: ChainName.IMTBL_ZKEVM_TESTNET,
      }),
      provider: {
        request: () => {},
      },
    } as any as Web3Provider,
    connectionStatus: ConnectionStatus.CONNECTED_WITH_NETWORK,
  };

  const cryptoConversions = new Map<string, number>([['eth', 1800], ['imx', 0.75]]);

  describe('balances', () => {
    const baseWalletState: WalletState = {
      network: {
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        name: ChainName.IMTBL_ZKEVM_TESTNET,
        nativeCurrency: {} as unknown as TokenInfo,
        isSupported: true,
      },
      walletProvider: WalletProviderName.METAMASK,
      tokenBalances: [],
      supportedTopUps: null,
    };

    it('should show balances', () => {
      cy.stub(Checkout.prototype, 'getAllBalances')
        .as('getAllBalances')
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
                address: IMX_ADDRESS_ZKEVM,
                icon: '123',
              },
            },
          ],
        });

      mount(
        <CustomAnalyticsProvider widgetConfig={{ environment: Environment.SANDBOX } as StrongCheckoutWidgetsConfig}>
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <WalletWidgetTestComponent
              initialStateOverride={baseWalletState}
              cryptoConversionsOverride={cryptoConversions}
            >
              <WalletBalances />
            </WalletWidgetTestComponent>
          </ConnectLoaderTestComponent>
        </CustomAnalyticsProvider>,
      );

      cySmartGet('balance-item-IMX').should('exist');
      cySmartGet('balance-item-ETH').should('exist');
    });

    it('should show shimmer while waiting for balances to load', () => {
      cy.stub(Checkout.prototype, 'getAllBalances').as('getAllBalances').rejects();

      mount(
        <CustomAnalyticsProvider widgetConfig={{ environment: Environment.SANDBOX } as StrongCheckoutWidgetsConfig}>
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <WalletWidgetTestComponent
              initialStateOverride={baseWalletState}
              cryptoConversionsOverride={cryptoConversions}
            >
              <WalletBalances />
            </WalletWidgetTestComponent>
          </ConnectLoaderTestComponent>
        </CustomAnalyticsProvider>,
      );

      cySmartGet('balance-item-shimmer--1__shimmer').should('be.visible');
      cySmartGet('balance-item-shimmer--2__shimmer').should('be.visible');
      cySmartGet('balance-item-shimmer--3__shimmer').should('be.visible');
      cySmartGet('total-token-balance-value__shimmer').should('be.visible');
    });

    it('should not show shimmers once balances has loaded', () => {
      cy.stub(Checkout.prototype, 'getAllBalances').as('getAllBalances');

      mount(
        <CustomAnalyticsProvider widgetConfig={{ environment: Environment.SANDBOX } as StrongCheckoutWidgetsConfig}>
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <WalletWidgetTestComponent
              initialStateOverride={baseWalletState}
              cryptoConversionsOverride={cryptoConversions}
            >
              <WalletBalances />
            </WalletWidgetTestComponent>
          </ConnectLoaderTestComponent>
        </CustomAnalyticsProvider>,
      );

      cySmartGet('balance-item-shimmer--1__shimmer').should('not.exist');
      cySmartGet('balance-item-shimmer--2__shimmer').should('not.exist');
      cySmartGet('balance-item-shimmer--3__shimmer').should('not.exist');
      cySmartGet('total-token-balance-value__shimmer').should('not.exist');
    });

    it('should show balances after getAllBalances failure', () => {
      cy.stub(Checkout.prototype, 'getAllBalances')
        .as('getAllBalances')
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
                address: IMX_ADDRESS_ZKEVM,
                icon: '123',
              },
            },
          ],
        });

      mount(
        <CustomAnalyticsProvider widgetConfig={{ environment: Environment.SANDBOX } as StrongCheckoutWidgetsConfig}>
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <WalletWidgetTestComponent
              initialStateOverride={baseWalletState}
              cryptoConversionsOverride={cryptoConversions}
            >
              <WalletBalances />
            </WalletWidgetTestComponent>
          </ConnectLoaderTestComponent>
        </CustomAnalyticsProvider>,
      );

      cySmartGet('balance-item-IMX').should('exist');
      cySmartGet('balance-item-ETH').should('exist');
    });

    it('should show no balances', () => {
      cy.stub(Checkout.prototype, 'getAllBalances')
        .as('getAllBalancesStub')
        .rejects({})
        .resolves({ balances: [] });

      mount(
        <CustomAnalyticsProvider widgetConfig={{ environment: Environment.SANDBOX } as StrongCheckoutWidgetsConfig}>
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <WalletWidgetTestComponent
              initialStateOverride={baseWalletState}
              cryptoConversionsOverride={cryptoConversions}
            >
              <WalletBalances />
            </WalletWidgetTestComponent>
          </ConnectLoaderTestComponent>
        </CustomAnalyticsProvider>,
      );

      cySmartGet('no-tokens-found').should('exist');
    });
  });

  describe('move coins gas check', () => {
    const baseWalletState = {
      network: {
        chainId: ChainId.SEPOLIA,
        name: ChainName.SEPOLIA,
        nativeCurrency: {} as unknown as TokenInfo,
        isSupported: true,
      },
      walletProvider: WalletProviderName.METAMASK,
      tokenBalances: [
        {
          id: 'eth',
          balance: '0.0',
          symbol: 'ETH',
          fiatAmount: '0',
        },
      ],
      supportedTopUps: {
        isBridgeEnabled: true,
      },
    };

    it('should show not enough gas drawer when trying to bridge to L2 with 0 eth balance', () => {
      cy.stub(Checkout.prototype, 'getAllBalances')
        .as('getAllBalancesStub')
        .resolves({
          balances: [
            {
              balance: BigNumber.from('10000000000000'),
              formattedBalance: '0.1',
              token: {
                name: 'ImmutableX',
                symbol: 'IMX',
                decimals: 18,
                address: IMX_ADDRESS_ZKEVM,
                icon: '123',
              },
            },
          ],
        });

      mount(
        <CustomAnalyticsProvider widgetConfig={{ environment: Environment.SANDBOX } as StrongCheckoutWidgetsConfig}>
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <WalletWidgetTestComponent
              initialStateOverride={baseWalletState}
              cryptoConversionsOverride={cryptoConversions}
            >
              <WalletBalances />
            </WalletWidgetTestComponent>
          </ConnectLoaderTestComponent>
        </CustomAnalyticsProvider>,
      );

      cySmartGet('token-menu').click();
      cySmartGet('balance-item-move-option').click();
      cySmartGet('not-enough-gas-bottom-sheet').should('be.visible');
      cySmartGet('not-enough-gas-copy-address-button').should('be.visible');
      cySmartGet('not-enough-gas-cancel-button').should('be.visible');
      cySmartGet('not-enough-gas-cancel-button').click();
      cySmartGet('not-enough-gas-bottom-sheet').should('not.exist');
    });

    it('should show not enough gas drawer when trying to bridge to L2 with eth balance less than gas', () => {
      cy.stub(Checkout.prototype, 'gasEstimate')
        .as('gasEstimateStub')
        .resolves({
          gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
          gasFee: {
            estimatedAmount: BigNumber.from('10000000000000000'),
          },
        });

      cy.stub(Checkout.prototype, 'getAllBalances')
        .as('getAllBalancesStub')
        .resolves({
          balances: [
            {
              balance: BigNumber.from('10000000000'),
              formattedBalance: '0.001',
              token: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
                address: '',
                icon: '123',
              },
            },
          ],
        });

      const walletState: WalletState = {
        network: {
          chainId: ChainId.SEPOLIA,
          name: 'Sepolia',
          nativeCurrency: {} as unknown as TokenInfo,
          isSupported: true,
        },
        walletProvider: WalletProviderName.METAMASK,
        tokenBalances: [
          {
            id: 'eth',
            balance: '0.001',
            symbol: 'ETH',
            fiatAmount: '0',
          },
        ],
        supportedTopUps: {
          isBridgeEnabled: true,
        },
      };

      mount(
        <CustomAnalyticsProvider widgetConfig={{ environment: Environment.SANDBOX } as StrongCheckoutWidgetsConfig}>
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <WalletWidgetTestComponent
              initialStateOverride={walletState}
              cryptoConversionsOverride={cryptoConversions}
            >
              <WalletBalances />
            </WalletWidgetTestComponent>
          </ConnectLoaderTestComponent>
        </CustomAnalyticsProvider>,
      );

      cySmartGet('token-menu').click();
      cySmartGet('balance-item-move-option').click();
      cySmartGet('not-enough-gas-bottom-sheet').should('be.visible');
      cySmartGet('not-enough-gas-copy-address-button').should('be.visible');
      cySmartGet('not-enough-gas-cancel-button').should('be.visible');
      cySmartGet('not-enough-gas-cancel-button').click();
      cySmartGet('not-enough-gas-bottom-sheet').should('not.exist');
    });

    it('should not show not enough gas drawer when enough eth to cover gas and call request bridge event', () => {
      cy.stub(orchestrationEvents, 'sendRequestBridgeEvent').as('requestBridgeEventStub');
      cy.stub(Checkout.prototype, 'gasEstimate')
        .as('gasEstimateStub')
        .resolves({
          gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
          gasFee: {
            estimatedAmount: BigNumber.from('10000000000000000'),
          },
        });

      cy.stub(Checkout.prototype, 'getAllBalances')
        .as('getAllBalancesStub')
        .resolves({
          balances: [
            {
              balance: BigNumber.from('1000000000000000'),
              formattedBalance: '100',
              token: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
                address: 'NATIVE',
                icon: '123',
              },
            },
          ],
        });

      const walletState: WalletState = {
        network: {
          chainId: ChainId.SEPOLIA,
          name: 'Sepolia',
          nativeCurrency: {} as unknown as TokenInfo,
          isSupported: true,
        },
        walletProvider: WalletProviderName.METAMASK,
        tokenBalances: [
          {
            id: 'eth',
            balance: '100',
            symbol: 'ETH',
            fiatAmount: '0',
            address: 'NATIVE',
          },
        ],
        supportedTopUps: {
          isBridgeEnabled: true,
        },
      };

      mount(
        <CustomAnalyticsProvider widgetConfig={{ environment: Environment.SANDBOX } as StrongCheckoutWidgetsConfig}>
          <ConnectLoaderTestComponent
            initialStateOverride={connectLoaderState}
          >
            <WalletWidgetTestComponent
              initialStateOverride={walletState}
              cryptoConversionsOverride={cryptoConversions}
            >
              <WalletBalances />
            </WalletWidgetTestComponent>
          </ConnectLoaderTestComponent>
        </CustomAnalyticsProvider>,
      );

      cySmartGet('token-menu').click();
      cySmartGet('balance-item-move-option').click();
      cySmartGet('not-enough-gas-bottom-sheet').should('not.exist');
      cySmartGet('@requestBridgeEventStub').should('have.been.called');
      cySmartGet('@requestBridgeEventStub').should(
        'have.been.calledWith',
        window,
        IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT,
        {
          tokenAddress: 'NATIVE',
          amount: '',
        },
      );
    });
  });

  describe('add coins button', () => {
    const baseWalletState: WalletState = {
      network: {
        chainId: ChainId.IMTBL_ZKEVM_TESTNET,
        name: ChainName.IMTBL_ZKEVM_TESTNET,
        nativeCurrency: {} as unknown as TokenInfo,
        isSupported: true,
      },
      walletProvider: WalletProviderName.METAMASK,
      tokenBalances: [],
      supportedTopUps: null,
    };

    it('should show add coins button on zkEVM when topUps are supported', () => {
      const topUpFeatureTestCases = [
        {
          isOnRampEnabled: true,
          isSwapEnabled: false,
          isBridgeEnabled: false,
        },
        {
          isOnRampEnabled: false,
          isSwapEnabled: true,
          isBridgeEnabled: false,
        },
        {
          isOnRampEnabled: false,
          isSwapEnabled: false,
          isBridgeEnabled: true,
        },
      ];
      topUpFeatureTestCases.forEach((topUpFeatures) => {
        const testWalletState = {
          ...baseWalletState,
          supportedTopUps: {
            ...topUpFeatures,
          },
        };
        mount(
          <BiomeCombinedProviders>
            <CustomAnalyticsProvider widgetConfig={{ environment: Environment.SANDBOX } as StrongCheckoutWidgetsConfig}>
              <ConnectLoaderTestComponent
                initialStateOverride={connectLoaderState}
              >
                <WalletContext.Provider
                  value={{ walletState: testWalletState, walletDispatch: () => {} }}
                >
                  <WalletBalances />
                </WalletContext.Provider>
              </ConnectLoaderTestComponent>
            </CustomAnalyticsProvider>
          </BiomeCombinedProviders>,
        );
        cySmartGet('add-coins').should('exist');
      });
    });

    it('should NOT show add coins on zkEVM when all supportedTopUps are disabled', () => {
      const testWalletState = {
        ...baseWalletState,
        supportedTopUps: {
          isOnRampEnabled: false,
          isSwapEnabled: false,
          isBridgeEnabled: false,
        },
      };
      mount(
        <BiomeCombinedProviders>
          <CustomAnalyticsProvider widgetConfig={{ environment: Environment.SANDBOX } as StrongCheckoutWidgetsConfig}>
            <ConnectLoaderTestComponent
              initialStateOverride={connectLoaderState}
            >
              <WalletContext.Provider
                value={{ walletState: testWalletState, walletDispatch: () => {} }}
              >
                <WalletBalances />
              </WalletContext.Provider>
            </ConnectLoaderTestComponent>
          </CustomAnalyticsProvider>
        </BiomeCombinedProviders>,
      );
      cySmartGet('add-coins').should('not.exist');
    });

    it('should NOT show add coins button on Sepolia', () => {
      const walletState: WalletState = {
        network: {
          chainId: ChainId.SEPOLIA,
          name: 'Sepolia',
          nativeCurrency: {} as unknown as TokenInfo,
          isSupported: true,
        },
        walletProvider: WalletProviderName.METAMASK,
        tokenBalances: [],
        supportedTopUps: {
          isOnRampEnabled: true,
          isSwapEnabled: true,
          isBridgeEnabled: true,
        },
      };
      mount(
        <BiomeCombinedProviders>
          <CustomAnalyticsProvider widgetConfig={{ environment: Environment.SANDBOX } as StrongCheckoutWidgetsConfig}>
            <ConnectLoaderTestComponent
              initialStateOverride={connectLoaderState}
            >
              <WalletContext.Provider
                value={{ walletState, walletDispatch: () => {} }}
              >
                <WalletBalances />
              </WalletContext.Provider>
            </ConnectLoaderTestComponent>
          </CustomAnalyticsProvider>
        </BiomeCombinedProviders>,
      );
      cySmartGet('add-coins').should('not.exist');
    });
  });
});
