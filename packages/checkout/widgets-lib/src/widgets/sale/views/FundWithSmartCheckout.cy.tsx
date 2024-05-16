import { mount } from 'cypress/react18';
import { cy, describe } from 'local-cypress';
import { Checkout } from '@imtbl/checkout-sdk';
import { ViewContextTestComponent } from '../../../context/view-context/test-components/ViewContextTestComponent';
import { cySmartGet } from '../../../lib/testUtils';
import { FundWithSmartCheckout } from './FundWithSmartCheckout';
import { FundWithSmartCheckoutSubViews } from '../../../context/view-context/SaleViewContextTypes';
import { CustomAnalyticsProvider } from '../../../context/analytics-provider/CustomAnalyticsProvider';

describe('FundWithSmartCheckout View', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
  });

  describe('subView template switching', () => {
    it('should render loading on INIT', () => {
      mount(
        <CustomAnalyticsProvider checkout={{} as Checkout}>
          <ViewContextTestComponent>
            <FundWithSmartCheckout subView={FundWithSmartCheckoutSubViews.INIT} />
          </ViewContextTestComponent>
        </CustomAnalyticsProvider>,
      );

      cySmartGet('loading-view').should('exist');
    });
    it('should render FundingRouteSelect on FUNDING_ROUTE_SELECT', () => {
      mount(
        <CustomAnalyticsProvider checkout={{} as Checkout}>
          <ViewContextTestComponent>
            <FundWithSmartCheckout subView={FundWithSmartCheckoutSubViews.FUNDING_ROUTE_SELECT} />
          </ViewContextTestComponent>
        </CustomAnalyticsProvider>,

      );

      cySmartGet('funding-route-select').should('exist');
    });
  });
});
