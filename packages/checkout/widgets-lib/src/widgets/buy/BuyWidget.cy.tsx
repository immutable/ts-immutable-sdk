import { BuyWidget, BuyWidgetParams } from './BuyWidget';
import { describe, it, cy, beforeEach } from 'local-cypress';
import { mount } from 'cypress/react18';
import { WidgetTheme } from '@imtbl/checkout-widgets';
import { cySmartGet } from '../../lib/testUtils';
import { Checkout, ConnectionProviders } from '@imtbl/checkout-sdk';

describe('BuyWidget tests', () => {
  beforeEach(() => {
    cy.stub(Checkout.prototype, 'checkIsWalletConnected')
      .as('isConnectedStub')
      .resolves({ isConnected: true });

    cy.stub(Checkout.prototype, 'connect')
      .as('connectStub')
      .resolves({
        provider: {
          getSigner: () => ({
            getAddress: () => Promise.resolve('dss'),
          }),
          getNetwork: async () => ({
            chainId: 1,
            name: 'Ethereum',
          }),
          provider: {
            request: async () => null,
          },
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
      });
  });

  it('should show buy widget on mount with the correct information displayed', () => {
    const params = {
      providerPreference: ConnectionProviders.METAMASK,
      orderId: '123',
    } as BuyWidgetParams;

    mount(<BuyWidget params={params} theme={WidgetTheme.DARK} />);

    cySmartGet('collection_name').should('have.text', 'Gods Unchained Cards');
    cySmartGet('asset_name').should('have.text', 'Furious Felid');
    cySmartGet('buy_amount').should('have.text', '10.0');
    cySmartGet('fees_heading').should('have.text', 'Fees');
    cySmartGet('fee_description_0').should('have.text', 'Royalty to 0x1bc:');
    cySmartGet('fee_amount_0').should('have.text', '0.01');
    cySmartGet('fee_description_1').should('have.text', 'Royalty to 0x2de:');
    cySmartGet('fee_amount_1').should('have.text', '0.02');
    cySmartGet('buy_asset_button').should('be.visible');
    cySmartGet('buy_asset_button').should('be.enabled');
  });
});
