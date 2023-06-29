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

export const cyIntercept = (overrides?: {
  configOverrides?: {},
  cryptoFiatOverrides?: {
    coins?: any[],
    conversion?: any[],
  },
}) => {
  const checkoutApi = 'https://checkout-api.dev.immutable.com/v1';
  cy.intercept(
    `${checkoutApi}/config`,
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
      gasEstimateTokens: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        11155111: {
          bridgeToL2Addresses: {
            gasTokenAddress: 'NATIVE',
            fromAddress: '0xd1da7e9b2Ce1a4024DaD52b3D37F4c5c91a525C1',
          },
          swapAddresses: {
            inAddress: '0x741185AEFC3E539c1F42c1d6eeE8bFf1c89D70FE',
            outAddress: '0xaC953a0d7B67Fae17c87abf79f09D0f818AC66A2',
          },
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        13383: {
          swapAddresses: {
            inAddress: '0xFEa9FF93DC0C6DC73F8Be009Fe7a22Bb9dcE8A2d',
            outAddress: '0x8AC26EfCbf5D700b37A27aA00E6934e6904e7B8e',
          },
        },
      },
    },
  );
  cy.intercept(
    `${checkoutApi}/fiat/coins/*`,
    overrides?.cryptoFiatOverrides?.coins || [],
  );
  cy.intercept(
    `${checkoutApi}/fiat/conversion*`,
    overrides?.cryptoFiatOverrides?.conversion || [],
  );
  cy.intercept(`${checkoutApi}/rpc/eth-sepolia`, []);
  cy.intercept('https://zkevm-rpc.dev.x.immutable.com/', []);
};
