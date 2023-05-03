import { mount } from 'cypress/react18';
import React from 'react';
import { NetworkMenu } from './NetworkMenu';
import { cySmartGet } from '../../../../lib/testUtils';
import { text } from '../../../../resources/text/textConfig';
import { WalletWidgetViews } from '../../../../context/WalletViewContextTypes';
import { BiomeThemeProvider } from '@biom3/react';
import { cy, it } from 'local-cypress';
import { Checkout, ConnectionProviders, TokenInfo } from '@imtbl/checkout-sdk';
import { WalletContext, WalletState } from '../../context/WalletContext';
import { Web3Provider } from '@ethersproject/providers';

describe('Network Menu', () => {
  let getNetworkAllowListStub;

  beforeEach(() => {
    getNetworkAllowListStub = cy
      .stub(Checkout.prototype, 'getNetworkAllowList')
      .as('getNetworkAllowListStub')
      .resolves({
        networks: [
          {
            name: 'Ethereum',
            chainId: 1,
          },
          {
            name: 'Polygon',
            chainId: 137,
          },
        ],
      });
  });
  it('should have heading', () => {
    mount(
      <BiomeThemeProvider>
        <NetworkMenu />
      </BiomeThemeProvider>
    );

    cySmartGet('network-heading').should(
      'include.text',
      text.views[WalletWidgetViews.WALLET_BALANCES].networkStatus.heading
    );
  });
  it('should have info icon', () => {
    mount(
      <BiomeThemeProvider>
        <NetworkMenu />
      </BiomeThemeProvider>
    );

    cySmartGet('network-icon').should('exist');
  });
  it('should have network buttons', () => {
    const walletState: WalletState = {
      checkout: new Checkout(),
      network: null,
      provider: null,
      providerPreference: ConnectionProviders.METAMASK,
    };
    mount(
      <BiomeThemeProvider>
        <WalletContext.Provider
          value={{ walletState, walletDispatch: () => {} }}
        >
          <NetworkMenu />
        </WalletContext.Provider>
      </BiomeThemeProvider>
    );
    cySmartGet('@getNetworkAllowListStub').should('have.been.called');
    cySmartGet('Ethereum-network-button').should('exist');
    cySmartGet('Polygon-network-button').should('exist');
  });

  it('should switch network', () => {
    cy.stub(Checkout.prototype, 'switchNetwork')
      .as('switchNetworkStub')
      .resolves({
        network: {
          chainId: 137,
          name: 'Polygon',
          nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18,
          },
        },
      });

    const walletState: WalletState = {
      checkout: new Checkout(),
      network: {
        chainId: 1,
        name: 'Ethereum',
        nativeCurrency: {} as unknown as TokenInfo,
        isSupported: false,
      },
      provider: {} as unknown as Web3Provider,
      providerPreference: ConnectionProviders.METAMASK,
    };
    mount(
      <BiomeThemeProvider>
        <WalletContext.Provider
          value={{ walletState, walletDispatch: () => {} }}
        >
          <NetworkMenu />
        </WalletContext.Provider>
      </BiomeThemeProvider>
    );

    cySmartGet('Polygon-network-button').click();

    cySmartGet('@switchNetworkStub').should('have.been.called');
    cySmartGet('@switchNetworkStub').should('have.been.calledWith', {
      provider: {},
      chainId: 137,
    });
  });
});
