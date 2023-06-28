import { cy } from 'local-cypress';

export const cyGetByTestId = (
  testId: string,
  options?: {
    domElement?: string;
  },
) => cy.get(
  `${options?.domElement ? options.domElement : ''}[data-testid="${testId}"]`,
);

export const cySmartGet = (selector: string) => (selector.includes('@') || selector.includes(' ')
  ? cy.get(selector)
  : cyGetByTestId(selector));
