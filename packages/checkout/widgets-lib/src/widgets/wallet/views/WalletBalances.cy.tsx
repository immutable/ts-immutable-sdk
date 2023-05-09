import { Checkout, ConnectionProviders, TokenInfo } from '@imtbl/checkout-sdk';
import { describe, it, cy } from 'local-cypress';
import { mount } from 'cypress/react18';
import { WalletBalances } from './WalletBalances';
import { BiomeCombinedProviders } from '@biom3/react';
import { WalletContext, WalletState } from '../context/WalletContext';
import { Web3Provider } from '@ethersproject/providers';
import { cySmartGet } from '../../../lib/testUtils';

describe('WalletBalances', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
  });

  const checkout = new Checkout();
  const provider = {} as unknown as Web3Provider;
  const baseWalletState: WalletState = {
    checkout: checkout,
    network: {
      chainId: 137,
      name: 'Polygon',
      nativeCurrency: {} as unknown as TokenInfo,
      isSupported: true,
    },
    provider,
    providerPreference: ConnectionProviders.METAMASK,
    tokenBalances: [],
    supportedTopUps: null,
  };

  it('should show add coins button on Polygon when topUps are supported', () => {
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
        </BiomeCombinedProviders>
      );
      cySmartGet('add-coins').should('exist');
    });
  });

  it('should NOT show add coins on Polygon when all supportedTopUps are disabled', () => {
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
      </BiomeCombinedProviders>
    );
    cySmartGet('add-coins').should('not.exist');
  });

  it('should NOT show add coins button on Ethereum', () => {
    const checkout = new Checkout();
    const provider = {} as unknown as Web3Provider;
    const walletState: WalletState = {
      checkout: checkout,
      network: {
        chainId: 1,
        name: 'Ethereum',
        nativeCurrency: {} as unknown as TokenInfo,
        isSupported: true,
      },
      provider,
      providerPreference: ConnectionProviders.METAMASK,
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
      </BiomeCombinedProviders>
    );
    cySmartGet('Ethereum-network-button').click();
    cySmartGet('add-coins').should('not.exist');
  });
});
