import { describe, it, cy } from 'local-cypress';
import { mount } from 'cypress/react18';
import { BiomeCombinedProviders } from '@biom3/react';
import { Environment } from '@imtbl/config';
import { TokenBalanceList } from './TokenBalanceList';
import { cyIntercept, cySmartGet } from '../../../../lib/testUtils';
import { ZERO_BALANCE_STRING } from '../../../../lib';
import { CustomAnalyticsProvider } from '../../../../context/analytics-provider/CustomAnalyticsProvider';
import { StrongCheckoutWidgetsConfig } from '../../../../lib/withDefaultWidgetConfig';

describe('TokenBalanceList', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
    cyIntercept();
  });

  it('should say no tokens found if balance info items empty', () => {
    mount(
      <BiomeCombinedProviders>
        <CustomAnalyticsProvider widgetConfig={{ environment: Environment.SANDBOX } as StrongCheckoutWidgetsConfig}>
          <TokenBalanceList
            balanceInfoItems={[]}
            bridgeToL2OnClick={() => {}}
          />
        </CustomAnalyticsProvider>
      </BiomeCombinedProviders>,
    );

    cySmartGet('no-tokens-found').should('have.text', 'No tokens found');
  });

  it('should show native token when balance is zero', () => {
    mount(
      <BiomeCombinedProviders>
        <CustomAnalyticsProvider widgetConfig={{ environment: Environment.SANDBOX } as StrongCheckoutWidgetsConfig}>
          <TokenBalanceList
            balanceInfoItems={[
              {
                id: 'imx',
                symbol: 'IMX',
                balance: ZERO_BALANCE_STRING,
                fiatAmount: '0',
              },
            ]}
            bridgeToL2OnClick={() => {}}
          />
        </CustomAnalyticsProvider>
      </BiomeCombinedProviders>,
    );

    cySmartGet('balance-item-IMX').should('exist');
  });

  it('should show non-zero balances', () => {
    mount(
      <BiomeCombinedProviders>
        <CustomAnalyticsProvider widgetConfig={{ environment: Environment.SANDBOX } as StrongCheckoutWidgetsConfig}>
          <TokenBalanceList
            balanceInfoItems={[
              {
                id: 'imx',
                symbol: 'IMX',
                balance: '2.0',
                fiatAmount: '2.00',
              },
              {
                id: 'zkone',
                symbol: 'zkONE',
                balance: '1',
                fiatAmount: '1.00',
                address: '0x123',
              },
              {
                id: 'zktkn',
                symbol: 'zkTOKEN',
                balance: ZERO_BALANCE_STRING,
                fiatAmount: '0.00',
                address: '0x234',
              },
            ]}
            bridgeToL2OnClick={() => {}}
          />
        </CustomAnalyticsProvider>
      </BiomeCombinedProviders>,
    );

    cySmartGet('balance-item-IMX').should('exist');
    cySmartGet('balance-item-zkONE').should('exist');
    cySmartGet('balance-item-zkTOKEN').should('not.exist');
  });
});
