import { describe, it } from 'local-cypress';
import { mount } from 'cypress/react18';
import { cySmartGet } from '../../lib/testUtils';
import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { HeaderNavigation } from './HeaderNavigation';
import { BiomeThemeProvider } from '@biom3/react';
import { onDarkBase, onLightBase } from '@biom3/design-tokens';

describe('HeaderNavigation', () => {
  describe('configurable buttons and title', () => {
    it('should show back button when configured', () => {
      mount(
        <BiomeThemeProvider theme={{ base: onDarkBase }}>
          <SimpleLayout header={<HeaderNavigation showBack />} />
        </BiomeThemeProvider>
      );

      cySmartGet('back-button').should('exist');
      cySmartGet('close-button').should('not.exist');
      cySmartGet('settings-button').should('not.exist');
      cySmartGet('header-title').should('have.text', '');
    });

    it('should show close button when configured', () => {
      mount(
        <BiomeThemeProvider theme={{ base: onDarkBase }}>
          <SimpleLayout
            header={
              <HeaderNavigation
                onCloseButtonClick={() => console.log('close clicked')}
              />
            }
          />
        </BiomeThemeProvider>
      );

      cySmartGet('back-button').should('not.exist');
      cySmartGet('close-button').should('exist');
      cySmartGet('settings-button').should('not.exist');
      cySmartGet('header-title').should('have.text', '');
    });

    it('should show settings button when configured with on click', () => {
      mount(
        <BiomeThemeProvider theme={{ base: onDarkBase }}>
          <SimpleLayout
            header={
              <HeaderNavigation
                showSettings
                onSettingsClick={() => console.log('test settings')}
              />
            }
          />
        </BiomeThemeProvider>
      );

      cySmartGet('back-button').should('not.exist');
      cySmartGet('close-button').should('not.exist');
      cySmartGet('settings-button').should('exist');
      cySmartGet('header-title').should('have.text', '');
    });

    it('should show title and close when configured', () => {
      mount(
        <BiomeThemeProvider theme={{ base: onDarkBase }}>
          <SimpleLayout
            header={
              <HeaderNavigation
                title="Test title"
                onCloseButtonClick={() => console.log('close clicked')}
              />
            }
          />
        </BiomeThemeProvider>
      );

      cySmartGet('back-button').should('not.exist');
      cySmartGet('close-button').should('exist');
      cySmartGet('header-title').should('have.text', 'Test title');
      cySmartGet('settings-button').should('not.exist');
    });

    it('should show back and close when configured', () => {
      mount(
        <BiomeThemeProvider theme={{ base: onDarkBase }}>
          <SimpleLayout
            header={
              <HeaderNavigation
                showBack
                onCloseButtonClick={() => console.log('close clicked')}
              />
            }
          />
        </BiomeThemeProvider>
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
        <BiomeThemeProvider theme={{ base: onLightBase }}>
          <SimpleLayout
            header={
              <HeaderNavigation
                showBack
                onCloseButtonClick={() => console.log('close clicked')}
              />
            }
          />
        </BiomeThemeProvider>
      );

      cySmartGet('header-navigation-container').should('exist');
      cySmartGet('header-navigation-container').should(
        'have.css',
        'background-color',
        'rgb(236, 236, 236)'
      );
    });

    it('should set transparent background when configured', () => {
      mount(
        <BiomeThemeProvider theme={{ base: onLightBase }}>
          <SimpleLayout
            header={
              <HeaderNavigation
                showBack
                transparent={false}
                onCloseButtonClick={() => console.log('close clicked')}
              />
            }
          />
        </BiomeThemeProvider>
      );

      cySmartGet('header-navigation-container').should('exist');
      cySmartGet('header-navigation-container').should(
        'have.css',
        'background-color',
        'rgba(0, 0, 0, 0)'
      );
    });
  });
});
