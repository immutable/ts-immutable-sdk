import { mount } from 'cypress/react18';
import { cy, describe } from 'local-cypress';
import { ViewContextTestComponent } from '../../../context/view-context/test-components/ViewContextTestComponent';
import { cySmartGet } from '../../../lib/testUtils';
import { OrderInProgress } from './OrderInProgress';

describe('OrderInProgress View', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
  });

  it('should render the OrderInProgress view', () => {
    mount(
      <ViewContextTestComponent>
        <OrderInProgress />
      </ViewContextTestComponent>,
    );

    cySmartGet('order-in-progress-view').should('exist');
    cySmartGet('simple-text-body__heading').should('have.text', 'Order in progress');
    cySmartGet('simple-text-body__body').should(
      'have.text',
      // eslint-disable-next-line max-len
      'You’ll receive an email from Transak when complete. This can take up to 3 mins.You can close this window, the transaction will be reflected in your wallet once complete.',
    );
  });
});
