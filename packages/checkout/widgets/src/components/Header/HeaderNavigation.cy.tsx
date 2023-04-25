
import { describe, it } from 'local-cypress'
import { mount } from 'cypress/react18';
import { cySmartGet } from '../../lib/testUtils';
import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { HeaderNavigation } from './HeaderNavigation';
import { BiomeThemeProvider } from '@biom3/react';

describe('HeaderNavigation', () => {
  describe('configurable buttons and title', () => {
    it('should show back button when configured', () => {
      mount(<BiomeThemeProvider>
        <SimpleLayout header={
        <HeaderNavigation showBack />
      } /></BiomeThemeProvider>
      )
  
      cySmartGet('back-button').should('exist')
      cySmartGet('close-button').should('not.exist')
      cySmartGet('settings-button').should('not.exist')
      cySmartGet('header-title').should('have.text', "")
    });
  
    it('should show close button when configured', () => {
      mount(<BiomeThemeProvider><SimpleLayout header={
        <HeaderNavigation showClose />
      } /></BiomeThemeProvider>)
  
      cySmartGet('back-button').should('not.exist')
      cySmartGet('close-button').should('exist')
      cySmartGet('settings-button').should('not.exist')
      cySmartGet('header-title').should('have.text', "")
    });
  
    it('should show settings button when configured with on click', () => {
      mount(<BiomeThemeProvider><SimpleLayout header={
        <HeaderNavigation showSettings onSettingsClick={() => console.log('test settings')} />
      } /></BiomeThemeProvider>)
  
      cySmartGet('back-button').should('not.exist')
      cySmartGet('close-button').should('not.exist')
      cySmartGet('settings-button').should('exist')
      cySmartGet('header-title').should('have.text', "")
    });
  
    it('should show title and close when configured', () => {
      mount(<BiomeThemeProvider><SimpleLayout header={
        <HeaderNavigation title="Test title" showClose />
      } /></BiomeThemeProvider>)
  
      cySmartGet('back-button').should('not.exist')
      cySmartGet('close-button').should('exist')
      cySmartGet('header-title').should('have.text', "Test title")
      cySmartGet('settings-button').should('not.exist')
    });
  
    it('should show back and close when configured', () => {
      mount(<BiomeThemeProvider><SimpleLayout header={
        <HeaderNavigation showBack showClose />
      } /></BiomeThemeProvider>)
  
      cySmartGet('back-button').should('exist')
      cySmartGet('close-button').should('exist')
      cySmartGet('header-title').should('have.text', "")
      cySmartGet('settings-button').should('not.exist')
    })
  })

  describe('HeaderNavigation styling', () => {
    it('should set transparent background when configured', () => {
      mount(<BiomeThemeProvider><SimpleLayout header={
        <HeaderNavigation showBack showClose transparent />
      } /></BiomeThemeProvider>)

      cySmartGet('header-navigation-container').should('exist')
      cySmartGet('header-navigation-container').should('have.css', 'background-color', 'rgba(0, 0, 0, 0)')
    })
  })
  
})