import React from 'react';
import { Checkout, ConnectionProviders } from '@imtbl/checkout-sdk-web';
import { WidgetTheme } from '@imtbl/checkout-ui-types';
import { describe, it, cy } from 'local-cypress';
import { mount } from 'cypress/react18';
import { cySmartGet } from '../../lib/testUtils';
import { WalletWidget, WalletWidgetParams } from './WalletWidget';

describe('WalletWidget tests', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
  });
  it('should show loading screen when component is mounted', () => {
    const params = {
      providerPreference: ConnectionProviders.METAMASK,
    } as WalletWidgetParams;

    const balanceStub = cy
      .stub(Checkout.prototype, 'getBalance')
      .as('balanceNoNetworkStub');
    balanceStub.rejects({});
    const connectStub = cy
      .stub(Checkout.prototype, 'connect')
      .as('connectNoNetworkStub');
    connectStub.resolves({
      provider: {
        getSigner: () => ({
          getAddress: async () => Promise.resolve(''),
        }),
        getNetwork: async () => ({
          chainId: 0,
          name: '',
        }),
      },
      network: { name: '' },
    });

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

    mount(<WalletWidget params={params} theme={WidgetTheme.DARK} />);

    cySmartGet('loading-view').should('be.visible');
    cySmartGet('wallet-balances').should('be.visible');
  });

  describe('WalletWidget balances', () => {
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
              chainId: 137,
              name: 'Polygon',
            }),
          },
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

      getAllBalancesStub = cy
        .stub(Checkout.prototype, 'getAllBalances')
        .as('balanceStub');

      getAllBalancesStub.resolves({
        balances: [
          {
            formattedBalance: '12.12',
            token: {
              name: 'Ether',
              symbol: 'ETH',
              decimals: 18,
            },
          },
          {
            formattedBalance: '88888999',
            token: {
              name: 'Immutable X',
              symbol: 'IMX',
              decimals: 18,
            },
          },
          {
            formattedBalance: '100000000.2',
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
            chainId: 137,
            name: 'Polygon',
            nativeCurrency: {
              name: 'MATIC',
              symbol: 'MATIC',
              decimals: 18,
            },
          },
        });
    });

    it('should show the network and user balances on that network', () => {
      const params = {
        providerPreference: ConnectionProviders.METAMASK,
      } as WalletWidgetParams;

      mount(<WalletWidget params={params} theme={WidgetTheme.DARK} />);

      cySmartGet('@balanceStub').should('have.been.called');
      cySmartGet('@connectStub').should('have.been.calledWith', {
        providerPreference: 'metamask',
      });

      cySmartGet('close-button').should('be.visible');
      cySmartGet('heading').should('be.visible');
      cySmartGet('Ethereum-network-button').should('include.text', 'Ethereum');

      cySmartGet('total-token-balance').should('exist');
      cySmartGet('total-token-balance').should('have.text', '≈ USD $70.50');

      cySmartGet('balance-item-ETH').should('exist');
      cySmartGet('balance-item-GODS').should('exist');
      cySmartGet('balance-item-IMX').should('exist');
    });

    it('should show the balance details for each token', () => {
      const params = {
        providerPreference: ConnectionProviders.METAMASK,
      } as WalletWidgetParams;
      mount(<WalletWidget params={params} theme={WidgetTheme.DARK} />);

      cySmartGet('@balanceStub').should('have.been.called');
      cySmartGet('@connectStub').should('have.been.calledWith', {
        providerPreference: 'metamask',
      });

      cySmartGet('balance-item-ETH').should('exist');
      cySmartGet('balance-item-ETH').should('include.text', 'ETH');
      cySmartGet('balance-item-ETH').should('include.text', 'Ether');
      cySmartGet('balance-item-ETH__price').should('have.text', '12.12');

      cySmartGet('balance-item-IMX').should('exist');
      cySmartGet('balance-item-IMX').should('include.text', 'IMX');
      cySmartGet('balance-item-IMX').should('include.text', 'Immutable X');
      cySmartGet('balance-item-IMX__price').should('have.text', '88,888,999');

      cySmartGet('balance-item-GODS').should('exist');
      cySmartGet('balance-item-GODS').should('include.text', 'GODS');
      cySmartGet('balance-item-GODS').should('include.text', 'Gods Unchained');
      cySmartGet('balance-item-GODS__price').should(
        'have.text',
        '100,000,000.2'
      );
    });
  });
});
