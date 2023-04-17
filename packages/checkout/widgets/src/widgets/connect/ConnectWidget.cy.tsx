import React from 'react'

import {Checkout, ConnectionProviders} from '@imtbl/checkout-sdk-web';
import { ConnectWidget, ConnectWidgetParams } from './ConnectWidget';
import { WidgetTheme } from '@imtbl/checkout-ui-types'
import { describe, it, cy } from 'local-cypress'
import { mount } from 'cypress/react18';
import { cySmartGet } from '../../lib/testUtils';

describe('ConnectWidget tests', () => {

  it('should show the connection options and close button on mount', () => {
    const params = {
        providerPreference: ConnectionProviders.METAMASK,
      } as ConnectWidgetParams

    mount(<ConnectWidget params={params} theme={WidgetTheme.LIGHT}  />)

    cySmartGet('back-button').should('not.be.visible')
    cySmartGet('close-button').should('be.visible')
    cySmartGet('connect-passport').should('be.visible')
    cySmartGet('connect-other').should('be.visible')
    cySmartGet('other-wallets').should('not.be.visible')
    cySmartGet('choose-networks').should('not.be.visible')
    cySmartGet('fail').should('not.be.visible')
    cySmartGet('success').should('not.be.visible')

  })

  it('should show the other wallet options when clicked', () => {
    const params = {
        providerPreference: ConnectionProviders.METAMASK,
      } as ConnectWidgetParams

    mount(<ConnectWidget params={params} theme={WidgetTheme.LIGHT}  />)

    cySmartGet('connect-other').click()

    cySmartGet('back-button').should('be.visible')
    cySmartGet('close-button').should('be.visible')
    cySmartGet('connect-wallet').should('not.be.visible')
    cySmartGet('other-wallets').should('be.visible')
    cySmartGet('other-metamask').should('be.visible')
    cySmartGet('other-walletconnect').should('be.visible')
    cySmartGet('choose-networks').should('not.be.visible')
    cySmartGet('fail').should('not.be.visible')
    cySmartGet('success').should('not.be.visible')

  })

  it('should show the zkevm connection option when metamask selected', () => {
    const params = {
        providerPreference: ConnectionProviders.METAMASK,
      } as ConnectWidgetParams

    mount(<ConnectWidget params={params}  theme={WidgetTheme.LIGHT}  />)

    cy.stub(Checkout.prototype, 'connect').resolves({});
    cySmartGet('connect-other').click()

    cySmartGet('other-metamask').click()

    cySmartGet('back-button').should('be.visible')
    cySmartGet('close-button').should('be.visible')
    cySmartGet('connect-wallet').should('not.be.visible')
    cySmartGet('other-wallets').should('not.be.visible')
    cySmartGet('choose-networks').should('be.visible')
    cySmartGet('network-zkevm').should('be.visible')
    cySmartGet('fail').should('not.be.visible')
    cySmartGet('success').should('not.be.visible')
  })

  it('should show the success screen once the network is selected', () => {
    const params = {
        providerPreference: ConnectionProviders.METAMASK,
      } as ConnectWidgetParams

    mount(<ConnectWidget params={params}  theme={WidgetTheme.LIGHT}  />)

    cy.stub(Checkout.prototype, 'connect').as('connectStub').resolves({
      provider:{}
    });
    cy.stub(Checkout.prototype, 'switchNetwork').resolves({});

    cySmartGet('connect-other').click()

    cySmartGet('other-metamask').click()

    cySmartGet('network-zkevm').click()

    cySmartGet('back-button').should('be.visible')
    cySmartGet('close-button').should('be.visible')
    cySmartGet('connect-wallet').should('not.be.visible')
    cySmartGet('other-wallets').should('not.be.visible')
    cySmartGet('choose-networks').should('not.be.visible')
    cySmartGet('fail').should('not.be.visible')
    cySmartGet('success').should('be.visible')
  })

})
