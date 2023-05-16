import {
  describe, it, cy, beforeEach,
} from 'local-cypress';
import { mount } from 'cypress/react18';
import { WidgetTheme } from '@imtbl/checkout-widgets';
import { Environment } from '@imtbl/config';
import { Checkout } from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { SwapWidgetParams, SwapWidget } from '../SwapWidget';
import { cySmartGet } from '../../../lib/testUtils';

describe('SwapCoins tests', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
  });

  beforeEach(() => {
    cy.stub(Checkout.prototype, 'connect')
      .as('connectStub')
      .resolves({
        provider: {
          getSigner: () => ({
            getAddress: () => Promise.resolve('dss'),
          }),
          getNetwork: async () => ({
            chainId: 1,
            name: 'Ethereum',
          }),
          provider: {
            request: async () => null,
          },
        },
        network: {
          chainId: 1,
          name: 'Ethereum',
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18,
          },
        },
      });

    cy.stub(Checkout.prototype, 'getAllBalances')
      .as('getAllBalancesStub')
      .resolves({
        balances: [
          {
            balance: BigNumber.from('10000000000000'),
            formattedBalance: '0.1',
            token: {
              name: 'IMX',
              symbol: 'IMX',
              decimals: 18,
              address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
            },
          },
        ],
      });

    cy.stub(Checkout.prototype, 'getTokenAllowList')
      .as('getTokenAllowListStub')
      .resolves({
        tokens: [
          {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
            address: '',
          },
          {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
            address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
          },
        ],
      });

    const params = {
      providerPreference: 'metamask',
    } as SwapWidgetParams;

    mount(
      <SwapWidget
        environment={Environment.PRODUCTION}
        params={params}
        theme={WidgetTheme.DARK}
      />,
    );
  });

  it('should only allow valid number up to 6 decimal places in from field', () => {
    cySmartGet('fromTokenInputs-text__input').focus().type('1234567');
    cySmartGet('fromTokenInputs-text__input').should('have.value', '1234567');
    cySmartGet('fromTokenInputs-text__input').clear();
    cySmartGet('fromTokenInputs-text__input').focus().type('12.123e4');
    cySmartGet('fromTokenInputs-text__input').should('have.value', '12.1234');
    cySmartGet('fromTokenInputs-text__input').clear();
    cySmartGet('fromTokenInputs-text__input').focus().type('12.1234567');
    cySmartGet('fromTokenInputs-text__input').should('have.value', '12.123456');
  });

  it('should only allow valid number up to 6 decimal places in to field', () => {
    cySmartGet('toTokenInputs-text__input').focus().type('1234567');
    cySmartGet('toTokenInputs-text__input').should('have.value', '1234567');
    cySmartGet('toTokenInputs-text__input').clear();

    cySmartGet('toTokenInputs-text__input').focus().type('12.123e4');
    cySmartGet('toTokenInputs-text__input').should('have.value', '12.1234');
    cySmartGet('toTokenInputs-text__input').clear();

    cySmartGet('toTokenInputs-text__input').focus().type('12.1234567');
    cySmartGet('toTokenInputs-text__input').should('have.value', '12.123456');
  });

  it('should show token balances list in from select', () => {
    cySmartGet('fromTokenInputs-select__target').click();
    cySmartGet('fromTokenInputs-select-IMX-IMX').should('be.visible');
    cySmartGet('fromTokenInputs-select-ETH-Ethereum').should('not.exist');
    cySmartGet('fromTokenInputs-select-IMX-IMX').click();
    cySmartGet('fromTokenInputs-select__target')
      .find('span')
      .should('have.text', 'IMX');
  });

  it('should show allowed tokens list in to select', () => {
    cySmartGet('toTokenInputs-select__target').click();
    cySmartGet('toTokenInputs-select-ETH-Ethereum').should('be.visible');
    cySmartGet('toTokenInputs-select-IMX-IMX').should('be.visible');
    cySmartGet('toTokenInputs-select-ETH-Ethereum').click();
    cySmartGet('toTokenInputs-select__target')
      .find('span')
      .should('have.text', 'ETH');
    cySmartGet('toTokenInputs-select-IMX-IMX').should('not.exist');
  });
});
