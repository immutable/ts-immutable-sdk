import { BiomeCombinedProviders } from '@biom3/react';
import { mount } from 'cypress/react18';
import { cy, describe } from 'local-cypress';
import { cySmartGet } from '../../../lib/testUtils';
import { text } from '../../../resources/text/textConfig';
import { OnRampWidgetViews } from '../../../context/view-context/OnRampViewContextTypes';
import { OrderInProgress } from './OrderInProgress';

describe('OrderInProgress View', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
  });

  const { heading, body1, body2 } = text.views[OnRampWidgetViews.ONRAMP][OnRampWidgetViews.IN_PROGRESS].content;

  it('should render the OrderInProgress view', () => {
    mount(
      <BiomeCombinedProviders>
        <OrderInProgress />
      </BiomeCombinedProviders>,
    );

    cySmartGet('order-in-progress-view').should('exist');
    cySmartGet('simple-text-body__heading').should('have.text', heading);
    cySmartGet('simple-text-body__body').should('have.text', body1 + body2);
  });
});
