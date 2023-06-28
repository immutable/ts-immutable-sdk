import { ChainId, Checkout } from '@imtbl/checkout-sdk';
import { IMTBLWidgetEvents } from '@imtbl/checkout-widgets';
import {
  describe, it, cy, context,
} from 'local-cypress';
import { mount } from 'cypress/react18';
import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { Environment } from '@imtbl/config';
import { CryptoFiat } from '@imtbl/cryptofiat';
import { WalletWidget } from './WalletWidget';
import { cyInterceptCheckoutApi, cySmartGet } from '../../lib/testUtils';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { WidgetTheme } from '../../lib';
import { text } from '../../resources/text/textConfig';
import { WalletWidgetViews } from '../../context/view-context/WalletViewContextTypes';

describe('WalletWidget tests', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
    cyInterceptCheckoutApi();
  });

  const mockProvider = {
    getSigner: () => ({
      getAddress: () => Promise.resolve('0xwalletAddress'),
    }),
    getNetwork: async () => ({
      chainId: ChainId.IMTBL_ZKEVM_TESTNET,
      name: 'Immutable zkEVM Testnet',
    }),
    provider: {
      request: async () => null,
    },
  } as unknown as Web3Provider;

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
      <WalletWidget
        config={widgetConfig}
        web3Provider={mockProvider}
      />,
    );

    cySmartGet('loading-view').should('be.visible');
    cySmartGet('wallet-balances').should('be.visible');
  });

  context('Connected Wallet', () => {
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
              chainId: 1,
              name: 'Ethereum',
            }),
          },
          network: {
            chainId: 1,
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
              chainId: ChainId.IMTBL_ZKEVM_DEVNET,
              name: 'Immutable zkEVM devnet',
            }),
          },
          network: {
            chainId: ChainId.IMTBL_ZKEVM_DEVNET,
            name: 'Immutable zkEVM devnet',
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
              name: 'Immutable zkEVM devnet',
              chainId: ChainId.IMTBL_ZKEVM_DEVNET,
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
            chainId: ChainId.IMTBL_ZKEVM_DEVNET,
            name: 'Immutable zkEVM devnet',
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
          <WalletWidget
            config={widgetConfig}
            web3Provider={mockProvider}
          />,
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
          <WalletWidget
            config={widgetConfig}
            web3Provider={mockProvider}
          />,
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
          <WalletWidget
            config={widgetConfig}
            web3Provider={mockProvider}
          />,
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
          <WalletWidget
            config={widgetConfig}
            web3Provider={mockProvider}
          />,
        );
        cySmartGet('settings-button').click();
        cySmartGet('wallet-address').should('have.text', '0xwalletAddress');
      });

      it('should show a disconnect button that fires the right event when clicked', () => {
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
          <WalletWidget
            config={widgetConfig}
            web3Provider={mockProvider}
          />,
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
      it('should show the coin info view if the coin info icon is clicked', () => {
        const widgetConfig = {
          theme: WidgetTheme.DARK,
          environment: Environment.SANDBOX,
          isBridgeEnabled: false,
          isSwapEnabled: false,
          isOnRampEnabled: false,
        } as StrongCheckoutWidgetsConfig;

        mount(
          <WalletWidget
            config={widgetConfig}
            web3Provider={mockProvider}
          />,
        );

        const { heading, body } = text.views[WalletWidgetViews.COIN_INFO];
        cySmartGet('coin-info-icon').click();
        cy.get('body').contains(body);
        cy.get('body').contains(heading);
        cySmartGet('back-button').should('be.visible');
      });
    });
  });
});
