import { mount } from 'cypress/react18';
import { ViewContextTestComponent } from 'context/view-context/test-components/ViewContextTestComponent';
import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { cySmartGet } from '../../lib/testUtils';

describe('Footer Logo', () => {
  it('should show the immutable logo', () => {
    mount(
      <ViewContextTestComponent>
        <SimpleLayout />
      </ViewContextTestComponent>,
    );

    cySmartGet('footer-logo-image').should('exist');
  });

  it('should hide the logo when configured', () => {
    mount(
      <ViewContextTestComponent>
        <SimpleLayout footerBrand={false} />
      </ViewContextTestComponent>,
    );

    cySmartGet('footer-logo-container').should('exist');
    cySmartGet('footer-logo-image').should('not.exist');
  });
});
