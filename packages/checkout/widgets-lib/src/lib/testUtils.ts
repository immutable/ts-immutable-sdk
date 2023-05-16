import { cy } from 'local-cypress';

/**
 * Allows the simple selection of testid's
 *
 * @param testId - (string) the selector lookup string
 * @returns Cypress.Chainable
 *
 * @alpha maturity
 */
export const cyGetByTestId = (
  testId: string,
  options?: {
    domElement?: string;
  },
) => cy.get(
  `${options?.domElement ? options.domElement : ''}[data-testid="${testId}"]`,
);

/**
 * Allows the simple selection of both cypress aliases and testids
 *
 * @param selector - the selector lookup string
 * @returns Cypress.Chainable
 *
 * @alpha maturity
 */
export const cySmartGet = (selector: string) => (selector.includes('@') || selector.includes(' ')
  ? cy.get(selector)
  : cyGetByTestId(selector));
