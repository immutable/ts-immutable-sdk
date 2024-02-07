import { mount } from 'cypress/react18';
import { cy, describe } from 'local-cypress';
import { ViewContextTestComponent } from 'context/view-context/test-components/ViewContextTestComponent';
import { useTranslation } from 'react-i18next';
import { cySmartGet } from '../../../lib/testUtils';
import { OrderInProgress } from './OrderInProgress';

describe('OrderInProgress View', () => {
  const { t } = useTranslation();
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
    cySmartGet('simple-text-body__heading').should('have.text', t('views.ONRAMP.IN_PROGRESS.content.heading'));
    cySmartGet('simple-text-body__body').should(
      'have.text',
      t('views.ONRAMP.IN_PROGRESS.content.body1') + t('views.ONRAMP.IN_PROGRESS.content.body2'),
    );
  });
});
