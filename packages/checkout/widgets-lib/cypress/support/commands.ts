/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import { useTranslation } from 'react-i18next';
import * as ReactI18next from 'react-i18next';

declare global {
  namespace Cypress {
    interface Chainable {
      stubI18n: typeof useTranslation;
    }
  }
}

Cypress.Commands.add('stubI18n', () => {
  const t = (key: string) => key; // Simplistic translation function
  cy.stub(ReactI18next, 'useTranslation').returns({ t });
});
