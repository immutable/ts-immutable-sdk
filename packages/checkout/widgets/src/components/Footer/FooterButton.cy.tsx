import { onDarkBase } from "@biom3/design-tokens"
import { BiomeThemeProvider } from "@biom3/react"
import { SimpleLayout } from "../SimpleLayout/SimpleLayout"
import { FooterButton } from "./FooterButton"
import { mount } from "cypress/react18"
import { cySmartGet } from "../../lib/testUtils"

describe('Footer Button', () => {
  it('should have right aligned large button', () => {
    mount(<BiomeThemeProvider theme={{base: onDarkBase}}>
      <SimpleLayout footer={<FooterButton actionText="Let's go" onActionClick={() => console.log('test click')} /> }></SimpleLayout>
    </BiomeThemeProvider>)

    cySmartGet('footer-button-container').should('exist');
    cySmartGet('footer-button-container').should('have.css', 'display', 'flex');
    cySmartGet('footer-button-container').should('have.css', 'flex-direction', 'row');
    cySmartGet('footer-button-container').should('have.css', 'justify-content', 'flex-end');
    cySmartGet('footer-button').should('have.text', "Let's go");
  });

  it('should hide button when configured', () => {
    mount(<BiomeThemeProvider theme={{base: onDarkBase}}>
      <SimpleLayout footer={<FooterButton hideActionButton actionText="Let's go" onActionClick={() => console.log('test click')} /> }></SimpleLayout>
    </BiomeThemeProvider>)

  cySmartGet('footer-button-container').should('exist');
  cySmartGet('footer-button').should('not.exist');
  });
})