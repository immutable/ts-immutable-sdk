import { mount } from 'cypress/react18';
import React from 'react';
import { BiomeThemeProvider } from '@biom3/react';
import { cy, it } from 'local-cypress';
import { Checkout, ConnectionProviders, TokenInfo } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { WalletContext, WalletState } from '../../context/WalletContext';
import { text } from '../../../../resources/text/textConfig';
import { cySmartGet } from '../../../../lib/testUtils';
import { NetworkMenu } from './NetworkMenu';
import { WalletWidgetViews } from '../../../../context/view-context/WalletViewContextTypes';

describe('Network Menu', () => {
  beforeEach(() => {
    cy.stub(Checkout.prototype, 'getNetworkAllowList')
      .as('getNetworkAllowListStub')
      .resolves({
        networks: [
          {
            name: 'Ethereum',
            chainId: 1,
          },
          {
            name: 'ImmutablezkEVMTestnet',
            chainId: 13372,
          },
        ],
      });
  });
  it('should have heading', () => {
    mount(
      <BiomeThemeProvider>
        <NetworkMenu />
      </BiomeThemeProvider>,
    );

    cySmartGet('network-heading').should(
      'include.text',
      text.views[WalletWidgetViews.WALLET_BALANCES].networkStatus.heading,
    );
  });
  it('should have network buttons', () => {
    const walletState: WalletState = {
      checkout: new Checkout({
        baseConfig: { environment: Environment.PRODUCTION },
      }),
      network: null,
      provider: null,
      providerPreference: ConnectionProviders.METAMASK,
      tokenBalances: [],
      supportedTopUps: null,
    };
    mount(
      <BiomeThemeProvider>
        <WalletContext.Provider
          value={{ walletState, walletDispatch: () => {} }}
        >
          <NetworkMenu />
        </WalletContext.Provider>
      </BiomeThemeProvider>,
    );
    cySmartGet('@getNetworkAllowListStub').should('have.been.called');
    cySmartGet('Ethereum-network-button').should('exist');
    cySmartGet('ImmutablezkEVMTestnet-network-button').should('exist');
  });

  it('should switch network', () => {
    cy.stub(Checkout.prototype, 'switchNetwork')
      .as('switchNetworkStub')
      .resolves({
        network: {
          chainId: 13372,
          name: 'ImmutablezkEVMTestnet',
          nativeCurrency: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
          },
        },
      });

    const walletState: WalletState = {
      checkout: new Checkout({
        baseConfig: { environment: Environment.PRODUCTION },
      }),
      network: {
        chainId: 1,
        name: 'Ethereum',
        nativeCurrency: {} as unknown as TokenInfo,
        isSupported: false,
      },
      provider: {} as unknown as Web3Provider,
      providerPreference: ConnectionProviders.METAMASK,
      tokenBalances: [],
      supportedTopUps: null,
    };
    mount(
      <BiomeThemeProvider>
        <WalletContext.Provider
          value={{ walletState, walletDispatch: () => {} }}
        >
          <NetworkMenu />
        </WalletContext.Provider>
      </BiomeThemeProvider>,
    );

    cySmartGet('ImmutablezkEVMTestnet-network-button').click();

    cySmartGet('@switchNetworkStub').should('have.been.called');
    cySmartGet('@switchNetworkStub').should('have.been.calledWith', {
      provider: {},
      chainId: 13372,
    });
  });
});
