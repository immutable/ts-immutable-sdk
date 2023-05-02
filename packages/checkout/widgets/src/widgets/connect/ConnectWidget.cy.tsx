import {
  Checkout,
  ConnectParams,
  ConnectionProviders,
} from '@imtbl/checkout-sdk';
import { ConnectWidget, ConnectWidgetParams } from './ConnectWidget';
import { WidgetTheme } from '@imtbl/checkout-widgets-react';
import { describe, it, cy } from 'local-cypress';
import { mount } from 'cypress/react18';
import { cySmartGet } from '../../lib/testUtils';

describe('ConnectWidget tests', () => {
  /** mounting the connect widget should be done to start all tests */
  const mountConnectWidget = () => {
    const params = {
      providerPreference: ConnectionProviders.METAMASK,
    } as ConnectWidgetParams;

    mount(<ConnectWidget params={params} theme={WidgetTheme.DARK} />);
  };

  const mountConnectWidgetAndGoToReadyToConnect = () => {
    mountConnectWidget();
    cySmartGet('wallet-list-metamask').click();
  };

  beforeEach(() => {
    cy.viewport('ipad-2');
  });

  describe('Connect Wallet screen', () => {
    it('should show MetaMask wallet option on desktop', () => {
      mountConnectWidget();

      cySmartGet('wallet-list').should('exist');
      cySmartGet('wallet-list-metamask').should('be.visible');
    });

    it('should show the Immutable Logo in the footer', () => {
      mountConnectWidget();

      cySmartGet('footer-logo-container').should('exist');
      cySmartGet('footer-logo-image').should('exist');
    });

    it('should update the view to Ready to Connect screen when MetaMask is clicked', () => {
      mountConnectWidget();

      cySmartGet('wallet-list-metamask').click();
      cySmartGet('ready-to-connect').should('be.visible');
    });
  });

  describe('Ready to connect screen', () => {
    it('should show MetaMask logo in Hero content', () => {
      mountConnectWidgetAndGoToReadyToConnect();
      cySmartGet('ready-to-connect').should('be.visible');
      cySmartGet('metamask-connect-hero').should('be.visible');
      cySmartGet('metamask-connect-hero-logo').should('be.visible');
    });

    it('should call checkout.connect() when Ready to connect is clicked', () => {
      cy.stub(Checkout.prototype, 'connect').as('connectStub').resolves({});
      mountConnectWidgetAndGoToReadyToConnect();
      cySmartGet('ready-to-connect').should('be.visible');
      cySmartGet('footer-button').should('have.text', 'Ready to connect');
      cySmartGet('footer-button').click();
      cySmartGet('@connectStub').should('have.been.calledOnceWith', {
        providerPreference: ConnectionProviders.METAMASK,
      } as ConnectParams);
    });

    it('should update footer button text to Try again when user rejects connection request', () => {
      cy.stub(Checkout.prototype, 'connect').as('connectStub').rejects({});
      mountConnectWidgetAndGoToReadyToConnect();
      cySmartGet('ready-to-connect').should('be.visible');
      cySmartGet('footer-button').should('have.text', 'Ready to connect');
      cySmartGet('footer-button').click();
      cySmartGet('@connectStub').should('have.been.calledOnceWith', {
        providerPreference: ConnectionProviders.METAMASK,
      } as ConnectParams);
      cySmartGet('footer-button').should('have.text', 'Try again');
    });

    it('should call checkout.connect() when Try again is clicked', () => {
      cy.stub(Checkout.prototype, 'connect').as('connectStub').rejects({});
      mountConnectWidgetAndGoToReadyToConnect();
      cySmartGet('ready-to-connect').should('be.visible');
      cySmartGet('footer-button').should('have.text', 'Ready to connect');
      cySmartGet('footer-button').click();
      cySmartGet('@connectStub').should('have.been.calledOnceWith', {
        providerPreference: ConnectionProviders.METAMASK,
      } as ConnectParams);
      cySmartGet('footer-button').should('have.text', 'Try again');
      cySmartGet('footer-button').click();
      cySmartGet('@connectStub').should('have.been.calledTwice');
    });

    it('should go back to Connect A Wallet screen when back is clicked', () => {
      mountConnectWidgetAndGoToReadyToConnect();
      cySmartGet('back-button').click();
      cySmartGet('ready-to-connect').should('not.exist');
      cySmartGet('connect-wallet').should('be.visible');
    });
  });
});
