import {
  Checkout, WalletProviderName, TokenInfo, ChainId,
} from '@imtbl/checkout-sdk';
import { describe, it, cy } from 'local-cypress';
import { mount } from 'cypress/react18';
import { BiomeCombinedProviders } from '@biom3/react';
import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { BigNumber } from 'ethers';
import { WalletBalances } from './WalletBalances';
import { WalletContext, WalletState } from '../context/WalletContext';
import { cySmartGet } from '../../../lib/testUtils';
import { WalletWidgetTestComponent } from '../test-components/WalletWidgetTestComponent';

describe('WalletBalances', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
    cy.intercept('https://checkout-api.dev.immutable.com/v1/config', {
      allowedNetworks: [
        {
          chainId: 11155111,
        },
        {
          chainId: 13383,
        },
      ],
    });
  });

  const checkout = new Checkout({
    baseConfig: { environment: Environment.SANDBOX },
  });

  const provider = {
    getSigner: () => ({
      getAddress: async () => Promise.resolve(''),
    }),
    provider: {
      request: async () => null,
    },
  } as unknown as Web3Provider;

  const baseWalletState: WalletState = {
    checkout,
    network: {
      chainId: ChainId.IMTBL_ZKEVM_DEVNET,
      name: 'Immutable zkEVM dev',
      nativeCurrency: {} as unknown as TokenInfo,
      isSupported: true,
    },
    provider,
    walletProvider: WalletProviderName.METAMASK,
    tokenBalances: [],
    supportedTopUps: null,
  };

  describe('balances', () => {
    it('should show balances', () => {
      cy.stub(Checkout.prototype, 'getAllBalances')
        .as('getAllBalancesStub')
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
                address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
                icon: '123',
              },
            },
          ],
        });

      mount(
        <WalletWidgetTestComponent initialStateOverride={baseWalletState}>
          <WalletBalances />
        </WalletWidgetTestComponent>,
      );

      cySmartGet('balance-item-IMX').should('exist');
      cySmartGet('balance-item-ETH').should('exist');
    });

    it('should show no balances', () => {
      cy.stub(Checkout.prototype, 'getAllBalances')
        .as('getAllBalancesStub')
        .rejects({});

      mount(
        <WalletWidgetTestComponent initialStateOverride={baseWalletState}>
          <WalletBalances />
        </WalletWidgetTestComponent>,
      );

      cySmartGet('no-tokens-found').should('exist');
    });
  });

  describe('add coins button', () => {
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
            <WalletContext.Provider
              value={{ walletState: testWalletState, walletDispatch: () => {} }}
            >
              <WalletBalances />
            </WalletContext.Provider>
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
          <WalletContext.Provider
            value={{ walletState: testWalletState, walletDispatch: () => {} }}
          >
            <WalletBalances />
          </WalletContext.Provider>
        </BiomeCombinedProviders>,
      );
      cySmartGet('add-coins').should('not.exist');
    });

    it('should NOT show add coins button on Sepolia', () => {
      const walletState: WalletState = {
        checkout,
        network: {
          chainId: ChainId.SEPOLIA,
          name: 'Sepolia',
          nativeCurrency: {} as unknown as TokenInfo,
          isSupported: true,
        },
        provider,
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
          <WalletContext.Provider
            value={{ walletState, walletDispatch: () => {} }}
          >
            <WalletBalances />
          </WalletContext.Provider>
        </BiomeCombinedProviders>,
      );
      cySmartGet('add-coins').should('not.exist');
    });
  });
});
