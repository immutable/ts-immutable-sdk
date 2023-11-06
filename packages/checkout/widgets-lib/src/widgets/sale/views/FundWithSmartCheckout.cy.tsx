import { BiomeCombinedProviders } from '@biom3/react';
import { mount } from 'cypress/react18';
import { cy, describe } from 'local-cypress';
import { WidgetTheme } from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';
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
          <BiomeCombinedProviders>
            <FundWithSmartCheckout subView={FundWithSmartCheckoutSubViews.INIT} />
          </BiomeCombinedProviders>
        </CustomAnalyticsProvider>,
      );

      cySmartGet('loading-view').should('exist');
    });
    it('should render FundingRouteSelect on FUNDING_ROUTE_SELECT', () => {
      mount(
        <CustomAnalyticsProvider widgetConfig={config}>
          <BiomeCombinedProviders>
            <FundWithSmartCheckout subView={FundWithSmartCheckoutSubViews.FUNDING_ROUTE_SELECT} />
          </BiomeCombinedProviders>
        </CustomAnalyticsProvider>,

      );

      cySmartGet('funding-route-select').should('exist');
    });
  });
});
