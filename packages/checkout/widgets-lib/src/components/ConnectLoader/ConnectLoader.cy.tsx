import { ChainId, Checkout, ConnectionProviders } from '@imtbl/checkout-sdk';
import { WidgetTheme } from '@imtbl/checkout-widgets';
import { describe, it, cy } from 'local-cypress';
import { mount } from 'cypress/react18';
import { Environment } from '@imtbl/config';
import { cySmartGet } from '../../lib/testUtils';
import { ConnectLoader, ConnectLoaderParams } from './ConnectLoader';

describe('ConnectLoader', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
  });

  it('should show connect widget when no provider preference', () => {
    const params = {} as ConnectLoaderParams;
    mount(
      <ConnectLoader
        environment={Environment.SANDBOX}
        params={params}
        theme={WidgetTheme.DARK}
        closeEvent={() => {}}
      >
        <div id="inner-widget">Inner Widget</div>
      </ConnectLoader>,
    );
    cySmartGet('wallet-list-metamask').should('be.visible');
    cy.get('#inner-widget').should('not.exist');
  });

  it('should show connect widget when user not connected', () => {
    const params = {
      providerPreference: ConnectionProviders.METAMASK,
    } as ConnectLoaderParams;

    cy.stub(Checkout.prototype, 'checkIsWalletConnected')
      .as('checkIsWalletConnectedStub')
      .resolves({
        isConnected: false,
      });

    mount(
      <ConnectLoader
        environment={Environment.SANDBOX}
        params={params}
        theme={WidgetTheme.DARK}
        closeEvent={() => {}}
      >
        <div id="inner-widget">Inner Widget</div>
      </ConnectLoader>,
    );

    cySmartGet('wallet-list-metamask').should('be.visible');
    cy.get('#inner-widget').should('not.exist');
  });

  it('should show connect widget when user on wrong network', () => {
    const params = {
      providerPreference: ConnectionProviders.METAMASK,
    } as ConnectLoaderParams;

    cy.stub(Checkout.prototype, 'checkIsWalletConnected')
      .as('checkIsWalletConnectedStub')
      .resolves({
        isConnected: true,
      });

    cy.stub(Checkout.prototype, 'connect')
      .as('connectStub')
      .resolves({
        provider: {
          getSigner: () => ({
            getAddress: async () => Promise.resolve(''),
          }),
          getNetwork: async () => ({
            chainId: 1,
            name: 'ETHEREUM',
          }),
        },
        network: { name: 'ETHEREUM' },
      });

    cy.stub(Checkout.prototype, 'getNetworkInfo')
      .as('getNetworkInfoStub')
      .resolves({
        isSupported: false,
      });

    mount(
      <ConnectLoader
        environment={Environment.SANDBOX}
        params={params}
        theme={WidgetTheme.DARK}
        closeEvent={() => {}}
      >
        <div id="inner-widget">Inner Widget</div>
      </ConnectLoader>,
    );

    cySmartGet('wallet-list-metamask').should('be.visible');
    cy.get('#inner-widget').should('not.exist');
  });

  it('should show inner widget when go through connect flow successfully', () => {
    const params = {
      providerPreference: ConnectionProviders.METAMASK,
    } as ConnectLoaderParams;

    cy.stub(Checkout.prototype, 'checkIsWalletConnected')
      .as('checkIsWalletConnectedStub')
      .resolves({
        isConnected: false,
      });

    cy.stub(Checkout.prototype, 'connect')
      .as('connectStub')
      .resolves({
        provider: {
          getSigner: () => ({
            getAddress: async () => Promise.resolve(''),
          }),
          getNetwork: async () => ({
            chainId: ChainId.IMTBL_ZKEVM_DEVNET,
            name: 'Immutable zkEVM Devnet',
          }),
        },
        network: { name: 'Immutable zkEVM Devnet' },
      });

    cy.stub(Checkout.prototype, 'getNetworkInfo')
      .as('getNetworkInfoStub')
      .resolves({
        isSupported: true,
        chainId: ChainId.IMTBL_ZKEVM_DEVNET,
      });

    mount(
      <ConnectLoader
        environment={Environment.SANDBOX}
        params={params}
        theme={WidgetTheme.DARK}
        closeEvent={() => {}}
      >
        <div id="inner-widget">Inner Widget</div>
      </ConnectLoader>,
    );

    cySmartGet('wallet-list-metamask').click();
    cySmartGet('footer-button').click();
    cy.get('#inner-widget').should('be.visible');
  });

  it('should not show connect flow when user already connected', () => {
    const params = {
      providerPreference: ConnectionProviders.METAMASK,
    } as ConnectLoaderParams;

    cy.stub(Checkout.prototype, 'checkIsWalletConnected')
      .as('checkIsWalletConnectedStub')
      .resolves({
        isConnected: true,
      });

    cy.stub(Checkout.prototype, 'connect')
      .as('connectStub')
      .resolves({
        provider: {
          getSigner: () => ({
            getAddress: async () => Promise.resolve(''),
          }),
          getNetwork: async () => ({
            chainId: 11155111,
            name: 'SEPOLIA',
          }),
        },
        network: { name: 'Sepolia' },
      });

    mount(
      <ConnectLoader
        environment={Environment.SANDBOX}
        params={params}
        theme={WidgetTheme.DARK}
        closeEvent={() => {}}
      >
        <div id="inner-widget">Inner Widget</div>
      </ConnectLoader>,
    );

    cy.get('#inner-widget').should('be.visible');
  });
});
