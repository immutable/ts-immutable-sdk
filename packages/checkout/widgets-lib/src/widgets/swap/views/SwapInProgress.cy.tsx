import { mount } from 'cypress/react18';
import { cy, describe } from 'local-cypress';
import { TransactionResponse } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { cyIntercept, cySmartGet } from '../../../lib/testUtils';
import { text } from '../../../resources/text/textConfig';
import { SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import { SwapInProgress } from './SwapInProgress';
import { SwapWidgetTestComponent } from '../test-components/SwapWidgetTestComponent';
import { CustomAnalyticsProvider } from '../../../context/analytics-provider/CustomAnalyticsProvider';
import { StrongCheckoutWidgetsConfig } from '../../../lib/withDefaultWidgetConfig';

describe('SwapInProgress View', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
    cyIntercept();
  });

  const { IN_PROGRESS: { loading } } = text.views[SwapWidgetViews.SWAP];

  it('should render the SwapInProgress view', () => {
    mount(
      <CustomAnalyticsProvider widgetConfig={{ environment: Environment.SANDBOX } as StrongCheckoutWidgetsConfig}>
        <SwapWidgetTestComponent>
          <SwapInProgress
            transactionResponse={{
              wait: () => ({ status: 1 }),
            } as unknown as TransactionResponse}
            swapForm={{
              fromAmount: '',
              fromContractAddress: '',
              toContractAddress: '',
            }}
          />
        </SwapWidgetTestComponent>
      </CustomAnalyticsProvider>,
    );

    cySmartGet('loading-view').should('exist');
    cySmartGet('loading-text').should('have.text', loading.text);
    cySmartGet('footer-logo-container').should('exist');
  });
});
