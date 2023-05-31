import {
  describe, it, cy, beforeEach,
} from 'local-cypress';
import { mount } from 'cypress/react18';
import { BiomeCombinedProviders } from '@biom3/react';
import { TopUpView } from './TopUpView';
import { cySmartGet } from '../../lib/testUtils';

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
});
