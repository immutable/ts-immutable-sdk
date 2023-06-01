import {
  describe, it, cy, beforeEach,
} from 'local-cypress';
import { mount } from 'cypress/react18';
import { BiomeCombinedProviders } from '@biom3/react';
import { IMTBLWidgetEvents } from '@imtbl/checkout-widgets';
import { TopUpView } from './TopUpView';
import { cySmartGet } from '../../lib/testUtils';
import { orchestrationEvents } from '../../lib/orchestrationEvents';

describe('Top Up View', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
  });

  it('should render the top up view', () => {
    mount(
      <BiomeCombinedProviders>
        <TopUpView
          showOnrampOption
          showSwapOption
          showBridgeOption
          onCloseButtonClick={() => {}}
        />
      </BiomeCombinedProviders>,
    );
    cySmartGet('menu-item-onramp').should('exist');
    cySmartGet('menu-item-swap').should('exist');
    cySmartGet('menu-item-bridge').should('exist');
  });

  it('should hide onramp option', () => {
    mount(
      <BiomeCombinedProviders>
        <TopUpView
          showOnrampOption={false}
          showSwapOption
          showBridgeOption
          onCloseButtonClick={() => {}}
        />
      </BiomeCombinedProviders>,
    );
    cySmartGet('menu-item-onramp').should('not.exist');
    cySmartGet('menu-item-swap').should('exist');
    cySmartGet('menu-item-bridge').should('exist');
  });

  it('should hide swap option', () => {
    mount(
      <BiomeCombinedProviders>
        <TopUpView
          showOnrampOption
          showSwapOption={false}
          showBridgeOption
          onCloseButtonClick={() => {}}
        />
      </BiomeCombinedProviders>,
    );
    cySmartGet('menu-item-onramp').should('exist');
    cySmartGet('menu-item-swap').should('not.exist');
    cySmartGet('menu-item-bridge').should('exist');
  });

  it('should hide bridge option', () => {
    mount(
      <BiomeCombinedProviders>
        <TopUpView
          showOnrampOption
          showSwapOption
          showBridgeOption={false}
          onCloseButtonClick={() => {}}
        />
      </BiomeCombinedProviders>,
    );
    cySmartGet('menu-item-onramp').should('exist');
    cySmartGet('menu-item-swap').should('exist');
    cySmartGet('menu-item-bridge').should('not.exist');
  });

  it('should call close function when close button clicked', () => {
    const closeFunction = cy.stub().as('closeFunction');
    mount(
      <BiomeCombinedProviders>
        <TopUpView
          showOnrampOption
          showSwapOption
          showBridgeOption
          widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
          onCloseButtonClick={closeFunction}
        />
      </BiomeCombinedProviders>,
    );
    cySmartGet('menu-item-onramp').should('exist');
    cySmartGet('menu-item-swap').should('exist');
    cySmartGet('menu-item-bridge').should('exist');
    cySmartGet('close-button').click();
    cy.get('@closeFunction').should('have.been.called');
  });

  it('should fire onramp event with onramp data on event when onramp clicked', () => {
    cy.stub(orchestrationEvents, 'sendRequestOnrampEvent').as('sendRequestOnrampEventStub');

    mount(
      <BiomeCombinedProviders>
        <TopUpView
          showOnrampOption
          showSwapOption
          showBridgeOption
          widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
          tokenAddress="0x123"
          amount="10"
          onCloseButtonClick={() => {}}
        />
      </BiomeCombinedProviders>,
    );

    cySmartGet('menu-item-onramp').click();
    cy.get('@sendRequestOnrampEventStub').should('have.been.called');
    cy.get('@sendRequestOnrampEventStub')
      .should(
        'have.been.calledWith',
        'imtbl-wallet-widget',
        { tokenAddress: '0x123', amount: '10' },
      );
  });

  it('should fire swap event with swap data on event when swap clicked', () => {
    cy.stub(orchestrationEvents, 'sendRequestSwapEvent').as('sendRequestSwapEventStub');

    mount(
      <BiomeCombinedProviders>
        <TopUpView
          showOnrampOption
          showSwapOption
          showBridgeOption
          widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
          tokenAddress="0x123"
          amount="10"
          onCloseButtonClick={() => {}}
        />
      </BiomeCombinedProviders>,
    );

    cySmartGet('menu-item-swap').click();
    cy.get('@sendRequestSwapEventStub').should('have.been.called');
    cy.get('@sendRequestSwapEventStub')
      .should(
        'have.been.calledWith',
        'imtbl-wallet-widget',
        // fromToken and amount should be empty for swap in top up
        { fromTokenAddress: '', toTokenAddress: '0x123', amount: '' },
      );
  });

  it('should fire bridge event with bridge data on event when bridge clicked', () => {
    cy.stub(orchestrationEvents, 'sendRequestBridgeEvent').as('sendRequestBridgeEventStub');

    mount(
      <BiomeCombinedProviders>
        <TopUpView
          showOnrampOption
          showSwapOption
          showBridgeOption
          widgetEvent={IMTBLWidgetEvents.IMTBL_WALLET_WIDGET_EVENT}
          tokenAddress="0x123"
          amount="10"
          onCloseButtonClick={() => {}}
        />
      </BiomeCombinedProviders>,
    );

    cySmartGet('menu-item-bridge').click();
    cy.get('@sendRequestBridgeEventStub').should('have.been.called');
    cy.get('@sendRequestBridgeEventStub')
      .should(
        'have.been.calledWith',
        'imtbl-wallet-widget',
        // tokenAddress and amount should be empty for bridging in top up
        { tokenAddress: '', amount: '' },
      );
  });
});
