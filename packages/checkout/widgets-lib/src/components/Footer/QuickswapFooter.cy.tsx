import { mount } from 'cypress/react18';
import { WidgetTheme } from '@imtbl/checkout-sdk';
import { ViewContextTestComponent } from 'context/view-context/test-components/ViewContextTestComponent';
import { Environment } from '@imtbl/config';
import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { cySmartGet } from '../../lib/testUtils';
import { QuickswapFooter } from './QuickswapFooter';

describe('Quickswap Footer', () => {
  it('should show the Quickswap logo', () => {
    mount(
      <ViewContextTestComponent theme={WidgetTheme.LIGHT}>
        <SimpleLayout footer={<QuickswapFooter environment={Environment.SANDBOX} theme={WidgetTheme.LIGHT} />} />
      </ViewContextTestComponent>,
    );

    cySmartGet('quickswap-logo').should('be.visible');
  });

  it('should show the disclaimer text', () => {
    mount(
      <ViewContextTestComponent theme={WidgetTheme.DARK}>
        <SimpleLayout footer={<QuickswapFooter environment={Environment.SANDBOX} theme={WidgetTheme.DARK} />} />
      </ViewContextTestComponent>,
    );

    cySmartGet(
      'quickswap-footer-disclaimer-text',
    ).should(
      'have.text',
      // eslint-disable-next-line max-len
      'Quickswap is a third party app. Immutable neither builds, owns, operates or deploys Quickswap. For further info, refer to Quickswap’s website.',
    );
  });
});
