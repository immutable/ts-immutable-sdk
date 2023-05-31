import { onDarkBase } from '@biom3/design-tokens';
import { BiomeCombinedProviders } from '@biom3/react';
import { mount } from 'cypress/react18';
import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { FooterButton } from './FooterButton';
import { cySmartGet } from '../../lib/testUtils';

describe('Footer Button', () => {
  it('should have right aligned large button', () => {
    mount(
      <BiomeCombinedProviders theme={{ base: onDarkBase }}>
        <SimpleLayout
          footer={(
            <FooterButton
              actionText="Let's go"
              // eslint-disable-next-line no-console
              onActionClick={() => console.log('test click')}
            />
          )}
        />
      </BiomeCombinedProviders>,
    );

    cySmartGet('footer-button-container').should('exist');
    cySmartGet('footer-button-container').should('have.css', 'display', 'flex');
    cySmartGet('footer-button-container').should(
      'have.css',
      'flex-direction',
      'row',
    );
    cySmartGet('footer-button-container').should(
      'have.css',
      'justify-content',
      'flex-end',
    );
    cySmartGet('footer-button').should('have.text', "Let's go");
  });

  it('should hide button when configured', () => {
    mount(
      <BiomeCombinedProviders theme={{ base: onDarkBase }}>
        <SimpleLayout
          footer={(
            <FooterButton
              hideActionButton
              actionText="Let's go"
              // eslint-disable-next-line no-console
              onActionClick={() => console.log('test click')}
            />
          )}
        />
      </BiomeCombinedProviders>,
    );

    cySmartGet('footer-button-container').should('exist');
    cySmartGet('footer-button').should('not.exist');
  });
});
