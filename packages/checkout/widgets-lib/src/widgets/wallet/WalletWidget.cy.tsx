import React from 'react';
import { Checkout, ConnectionProviders } from '@imtbl/checkout-sdk';
import { WidgetTheme } from '@imtbl/checkout-widgets';
import { describe, it, cy } from 'local-cypress';
import { mount } from 'cypress/react18';
import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { Environment } from '@imtbl/config';
import { CryptoFiat } from '@imtbl/cryptofiat';
import { WalletWidget, WalletWidgetParams } from './WalletWidget';
import { cySmartGet } from '../../lib/testUtils';

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

    mount(
      <WalletWidget
        environment={Environment.PRODUCTION}
        params={params}
        theme={WidgetTheme.DARK}
      />,
    );

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
              chainId: 13372,
              name: 'Immutable zkEVM Testnet',
            }),
          },
          network: {
            chainId: 13372,
            name: 'Immutable zkEVM Testnet',
            nativeCurrency: {
              name: 'IMX',
              symbol: 'IMX',
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
            chainId: 13372,
            name: 'Immutable zkEVM Testnet',
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

    it('should show the network and user balances on that network', () => {
      const params = {
        providerPreference: ConnectionProviders.METAMASK,
      } as WalletWidgetParams;

      mount(
        <WalletWidget
          environment={Environment.PRODUCTION}
          params={params}
          theme={WidgetTheme.DARK}
        />,
      );

      cySmartGet('@balanceStub').should('have.been.called');
      cySmartGet('@connectStub').should('have.been.calledWith', {
        providerPreference: 'metamask',
      });

      cySmartGet('close-button').should('be.visible');
      cySmartGet('heading').should('be.visible');
      cySmartGet('Ethereum-network-button').should('include.text', 'Ethereum');

      cySmartGet('total-token-balance').should('exist');
      cySmartGet('total-token-balance').should('have.text', '≈ USD $22525.46');

      cySmartGet('balance-item-ETH').should('exist');
      cySmartGet('balance-item-GODS').should('exist');
      cySmartGet('balance-item-IMX').should('exist');
    });

    it('should show the balance details for each token', () => {
      const params = {
        providerPreference: ConnectionProviders.METAMASK,
      } as WalletWidgetParams;
      mount(
        <WalletWidget
          environment={Environment.PRODUCTION}
          params={params}
          theme={WidgetTheme.DARK}
        />,
      );

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
      cySmartGet('balance-item-IMX__price').should('have.text', '899');

      cySmartGet('balance-item-GODS').should('exist');
      cySmartGet('balance-item-GODS').should('include.text', 'GODS');
      cySmartGet('balance-item-GODS').should('include.text', 'Gods Unchained');
      cySmartGet('balance-item-GODS__price').should('have.text', '100.2');
    });
  });
});
