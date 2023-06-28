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

export const cyInterceptCheckoutApi = (overrides?: {
  configOverrides?: {},
  cryptoFiatOverrides?: {
    coins?: any[],
    conversion?: any[],
  },
}) => {
  cy.intercept(
    'https://checkout-api.dev.immutable.com/v1/config',
    overrides?.configOverrides
    || {
      allowedNetworks: [
        {
          chainId: 11155111,
        },
        {
          chainId: 13383,
        },
      ],
    },
  );
  cy.intercept(
    'https://checkout-api.dev.immutable.com/v1/fiat/coins/*',
    overrides?.cryptoFiatOverrides?.coins || [],
  );
  cy.intercept(
    'https://checkout-api.dev.immutable.com/v1/fiat/conversion*',
    overrides?.cryptoFiatOverrides?.conversion || [],
  );
};
