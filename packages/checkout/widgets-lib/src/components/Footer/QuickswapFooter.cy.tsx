import { mount } from 'cypress/react18';
import { WidgetTheme } from '@imtbl/checkout-sdk';
import { ViewContextTestComponent } from 'context/view-context/test-components/ViewContextTestComponent';
import { useTranslation } from 'react-i18next';
import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { cySmartGet } from '../../lib/testUtils';
import { QuickswapFooter } from './QuickswapFooter';

describe('Quickswap Footer', () => {
  const { t } = useTranslation();
  it('should show the Quickswap logo', () => {
    mount(
      <ViewContextTestComponent theme={WidgetTheme.LIGHT}>
        <SimpleLayout footer={<QuickswapFooter theme={WidgetTheme.LIGHT} />} />
      </ViewContextTestComponent>,
    );

    cySmartGet('quickswap-logo').should('be.visible');
  });

  it('should show the disclaimer text', () => {
    mount(
      <ViewContextTestComponent theme={WidgetTheme.DARK}>
        <SimpleLayout footer={<QuickswapFooter theme={WidgetTheme.DARK} />} />
      </ViewContextTestComponent>,
    );

    cySmartGet(
      'quickswap-footer-disclaimer-text',
    ).should(
      'have.text',
      t('footers.quickswapFooter.disclaimerText'),
    );
  });
});
