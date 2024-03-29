import { mount } from 'cypress/react18';
import { cy, describe } from 'local-cypress';
import { TransactionResponse } from '@ethersproject/providers';
import { cyIntercept, cySmartGet } from '../../../lib/testUtils';
import { SwapInProgress } from './SwapInProgress';
import { SwapWidgetTestComponent } from '../test-components/SwapWidgetTestComponent';

describe('SwapInProgress View', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
    cyIntercept();
  });

  it('should render the SwapInProgress view', () => {
    mount(
      <SwapWidgetTestComponent>
        <SwapInProgress
          transactionResponse={{
            wait: () => ({ status: 1 }),
          } as unknown as TransactionResponse}
          swapForm={{
            fromAmount: '',
            fromTokenAddress: '',
            toTokenAddress: '',
            toAmount: '',
          }}
        />
      </SwapWidgetTestComponent>,
    );

    cySmartGet('loading-view').should('exist');
    cySmartGet('loading-text').should('have.text', 'Swap in progress');
    cySmartGet('footer-logo-container').should('exist');
  });
});
