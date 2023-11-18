import { onDarkBase, onLightBase } from '@biom3/design-tokens';
import { mount } from 'cypress/react18';
import { WidgetTheme } from '@imtbl/checkout-sdk';
import { ViewContextTestComponent } from 'context/view-context/test-components/ViewContextTestComponent';
import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { cySmartGet } from '../../lib/testUtils';
import { QuickswapFooter } from './QuickswapFooter';
import { text } from '../../resources/text/textConfig';

describe('Quickswap Footer', () => {
  it('should show the Quickswap logo', () => {
    mount(
      <ViewContextTestComponent theme={onLightBase}>
        <SimpleLayout footer={<QuickswapFooter theme={WidgetTheme.LIGHT} />} />
      </ViewContextTestComponent>,
    );

    cySmartGet('quickswap-logo').should('be.visible');
  });

  it('should show the disclaimer text', () => {
    mount(
      <ViewContextTestComponent theme={onDarkBase}>
        <SimpleLayout footer={<QuickswapFooter theme={WidgetTheme.DARK} />} />
      </ViewContextTestComponent>,
    );

    cySmartGet(
      'quickswap-footer-disclaimer-text',
    ).should(
      'have.text',
      text.footers.quickswapFooter.disclaimerText,
    );
  });
});
