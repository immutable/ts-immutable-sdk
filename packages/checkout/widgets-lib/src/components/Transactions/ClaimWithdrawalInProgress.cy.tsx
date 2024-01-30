import { mount } from 'cypress/react18';
import { cy, describe } from 'local-cypress';
import { TransactionResponse } from '@ethersproject/providers';
import { useTranslation } from 'react-i18next';
import { BridgeWidgetTestComponent } from 'widgets/bridge/test-components/BridgeWidgetTestComponent';
import { cyIntercept, cySmartGet } from 'lib/testUtils';
import { ClaimWithdrawalInProgress } from './ClaimWithdrawalInProgress';

describe('ClaimWithdrawalInProgress View', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
    cyIntercept();
  });

  const { t } = useTranslation();
  const loadingText = t('views.CLAIM_WITHDRAWAL.IN_PROGRESS.loading.text');

  it('should render the ClaimWithdrawalInProgress view', () => {
    mount(
      <BridgeWidgetTestComponent>
        <ClaimWithdrawalInProgress
          transactionResponse={{
            wait: () => ({ status: 1 }),
          } as unknown as TransactionResponse}
        />
      </BridgeWidgetTestComponent>,
    );

    cySmartGet('loading-view').should('exist');
    cySmartGet('loading-text').should('have.text', loadingText);
    cySmartGet('footer-logo-container').should('exist');
  });
});
