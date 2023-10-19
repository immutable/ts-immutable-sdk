import { BiomeCombinedProviders } from '@biom3/react';
import { mount } from 'cypress/react18';
import { cy, describe } from 'local-cypress';
import { cySmartGet } from '../../../lib/testUtils';
import { FundWithSmartCheckout } from './FundWithSmartCheckout';
import { FundWithSmartCheckoutSubViews } from '../../../context/view-context/SaleViewContextTypes';

describe('FundWithSmartCheckout View', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
  });

  describe('subView template switching', () => {
    it('should render loading on INIT', () => {
      mount(
        <BiomeCombinedProviders>
          <FundWithSmartCheckout subView={FundWithSmartCheckoutSubViews.INIT} />
        </BiomeCombinedProviders>,
      );

      cySmartGet('loading-view').should('exist');
    });
    it('should render FundingRouteSelect on FUNDING_ROUTE_SELECT', () => {
      mount(
        <BiomeCombinedProviders>
          <FundWithSmartCheckout subView={FundWithSmartCheckoutSubViews.FUNDING_ROUTE_SELECT} />
        </BiomeCombinedProviders>,
      );

      cySmartGet('funding-route-select').should('exist');
    });
    it('should render FundingRouteExecute on FUNDING_ROUTE_EXECUTE', () => {
      mount(
        <BiomeCombinedProviders>
          <FundWithSmartCheckout subView={FundWithSmartCheckoutSubViews.FUNDING_ROUTE_EXECUTE} />
        </BiomeCombinedProviders>,
      );

      cySmartGet('funding-route-execute').should('exist');
    });
  });
});
