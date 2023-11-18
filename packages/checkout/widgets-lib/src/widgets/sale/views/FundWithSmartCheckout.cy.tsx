import { mount } from 'cypress/react18';
import { cy, describe } from 'local-cypress';
import { WidgetTheme } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { ViewContextTestComponent } from 'context/view-context/test-components/ViewContextTestComponent';
import { cySmartGet } from '../../../lib/testUtils';
import { FundWithSmartCheckout } from './FundWithSmartCheckout';
import { FundWithSmartCheckoutSubViews } from '../../../context/view-context/SaleViewContextTypes';
import { CustomAnalyticsProvider } from '../../../context/analytics-provider/CustomAnalyticsProvider';
import { StrongCheckoutWidgetsConfig } from '../../../lib/withDefaultWidgetConfig';

describe('FundWithSmartCheckout View', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
  });

  const config: StrongCheckoutWidgetsConfig = {
    environment: Environment.SANDBOX,
    theme: WidgetTheme.DARK,
    isBridgeEnabled: true,
    isSwapEnabled: true,
    isOnRampEnabled: true,
  };

  describe('subView template switching', () => {
    it('should render loading on INIT', () => {
      mount(
        <CustomAnalyticsProvider widgetConfig={config}>
          <ViewContextTestComponent>
            <FundWithSmartCheckout subView={FundWithSmartCheckoutSubViews.INIT} />
          </ViewContextTestComponent>
        </CustomAnalyticsProvider>,
      );

      cySmartGet('loading-view').should('exist');
    });
    it('should render FundingRouteSelect on FUNDING_ROUTE_SELECT', () => {
      mount(
        <CustomAnalyticsProvider widgetConfig={config}>
          <ViewContextTestComponent>
            <FundWithSmartCheckout subView={FundWithSmartCheckoutSubViews.FUNDING_ROUTE_SELECT} />
          </ViewContextTestComponent>
        </CustomAnalyticsProvider>,

      );

      cySmartGet('funding-route-select').should('exist');
    });
  });
});
