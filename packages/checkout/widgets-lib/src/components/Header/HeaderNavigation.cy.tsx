/* eslint-disable no-console */
import { describe, it } from 'local-cypress';
import { mount } from 'cypress/react18';
import { onLightBase } from '@biom3/design-tokens';
import { ViewContextTestComponent } from 'context/view-context/test-components/ViewContextTestComponent';
import { cySmartGet } from '../../lib/testUtils';
import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { HeaderNavigation } from './HeaderNavigation';

describe('HeaderNavigation', () => {
  describe('configurable buttons and title', () => {
    it('should show back button when configured', () => {
      mount(
        <ViewContextTestComponent>
          <SimpleLayout header={<HeaderNavigation showBack />} />
        </ViewContextTestComponent>,
      );

      cySmartGet('back-button').should('exist');
      cySmartGet('close-button').should('not.exist');
      cySmartGet('settings-button').should('not.exist');
      cySmartGet('header-title').should('have.text', '');
    });

    it('should show close button when configured', () => {
      mount(
        <ViewContextTestComponent>
          <SimpleLayout
            header={(
              <HeaderNavigation
                onCloseButtonClick={() => console.log('close clicked')}
              />
            )}
          />
        </ViewContextTestComponent>,
      );

      cySmartGet('back-button').should('not.exist');
      cySmartGet('close-button').should('exist');
      cySmartGet('settings-button').should('not.exist');
      cySmartGet('header-title').should('have.text', '');
    });

    it('should show settings button when configured with on click', () => {
      mount(
        <ViewContextTestComponent>
          <SimpleLayout
            header={(
              <HeaderNavigation
                showSettings
                onSettingsClick={() => console.log('test settings')}
              />
            )}
          />
        </ViewContextTestComponent>,
      );

      cySmartGet('back-button').should('not.exist');
      cySmartGet('close-button').should('not.exist');
      cySmartGet('settings-button').should('exist');
      cySmartGet('header-title').should('have.text', '');
    });

    it('should show title and close when configured', () => {
      mount(
        <ViewContextTestComponent>
          <SimpleLayout
            header={(
              <HeaderNavigation
                title="Test title"
                onCloseButtonClick={() => console.log('close clicked')}
              />
            )}
          />
        </ViewContextTestComponent>,
      );

      cySmartGet('back-button').should('not.exist');
      cySmartGet('close-button').should('exist');
      cySmartGet('header-title').should('have.text', 'Test title');
      cySmartGet('settings-button').should('not.exist');
    });

    it('should show back and close when configured', () => {
      mount(
        <ViewContextTestComponent>
          <SimpleLayout
            header={(
              <HeaderNavigation
                showBack
                onCloseButtonClick={() => console.log('close clicked')}
              />
            )}
          />
        </ViewContextTestComponent>,
      );

      cySmartGet('back-button').should('exist');
      cySmartGet('close-button').should('exist');
      cySmartGet('header-title').should('have.text', '');
      cySmartGet('settings-button').should('not.exist');
    });
  });

  describe('HeaderNavigation styling', () => {
    it('should set solid background when configured', () => {
      mount(
        <ViewContextTestComponent theme={onLightBase}>
          <SimpleLayout
            header={(
              <HeaderNavigation
                showBack
                onCloseButtonClick={() => console.log('close clicked')}
              />
            )}
          />
        </ViewContextTestComponent>,
      );

      cySmartGet('header-navigation-container').should('exist');
      cySmartGet('header-navigation-container').should(
        'have.css',
        'background-color',
        'rgb(236, 236, 236)',
      );
    });

    it('should set transparent background when configured', () => {
      mount(
        <ViewContextTestComponent theme={onLightBase}>
          <SimpleLayout
            header={(
              <HeaderNavigation
                showBack
                transparent
                onCloseButtonClick={() => console.log('close clicked')}
              />
            )}
          />
        </ViewContextTestComponent>,
      );

      cySmartGet('header-navigation-container').should('exist');
      cySmartGet('header-navigation-container').should(
        'have.css',
        'background-color',
        'rgba(0, 0, 0, 0)',
      );
    });
  });
});
