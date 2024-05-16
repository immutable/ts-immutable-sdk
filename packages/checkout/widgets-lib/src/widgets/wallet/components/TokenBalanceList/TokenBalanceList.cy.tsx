import { describe, it, cy } from 'local-cypress';
import { mount } from 'cypress/react18';
import { WidgetTheme } from '@imtbl/checkout-sdk';
import { ViewContextTestComponent } from '../../../../context/view-context/test-components/ViewContextTestComponent';
import { TokenBalanceList } from './TokenBalanceList';
import { cyIntercept, cySmartGet } from '../../../../lib/testUtils';
import { ZERO_BALANCE_STRING } from '../../../../lib';

describe('TokenBalanceList', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
    cyIntercept();
  });

  it('should say no tokens found if balance info items empty', () => {
    mount(
      <ViewContextTestComponent>
        <TokenBalanceList
          balanceInfoItems={[]}
          bridgeToL2OnClick={() => {}}
          theme={WidgetTheme.DARK}
        />
      </ViewContextTestComponent>,
    );

    cySmartGet('no-tokens-found').should('have.text', 'No tokens found');
  });

  it('should show native token when balance is zero', () => {
    mount(
      <ViewContextTestComponent>
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
          theme={WidgetTheme.DARK}
        />
      </ViewContextTestComponent>,
    );

    cySmartGet('balance-item-IMX').should('exist');
  });

  it('should show non-zero balances', () => {
    mount(
      <ViewContextTestComponent>
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
          theme={WidgetTheme.DARK}
        />
      </ViewContextTestComponent>,
    );

    cySmartGet('balance-item-IMX').should('exist');
    cySmartGet('balance-item-zkONE').should('exist');
    cySmartGet('balance-item-zkTOKEN').should('not.exist');
  });
});
