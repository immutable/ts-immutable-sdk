import { SwapWidget, SwapWidgetParams } from './SwapWidget';
import { describe, it, cy, beforeEach } from 'local-cypress';
import { mount } from 'cypress/react18';
import { WidgetTheme } from '@imtbl/checkout-widgets';
import { cySmartGet } from '../../lib/testUtils';
import { Checkout } from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { Environment } from '@imtbl/config';

describe('SwapWidget tests', () => {
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
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18,
              address: '',
              icon: '123',
            },
          },
          {
            balance: BigNumber.from('10000000000000'),
            formattedBalance: '0.1',
            token: {
              name: 'Immutable X',
              symbol: 'IMX',
              decimals: 18,
              address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
              icon: '123',
            },
          },
        ],
      });
  });

  it('should show swap widget on mount', () => {
    const params = {
      providerPreference: 'metamask',
    } as SwapWidgetParams;
    mount(
      <SwapWidget
        environment={Environment.PRODUCTION}
        params={params}
        theme={WidgetTheme.DARK}
      />
    );
    cySmartGet('buyField__selected-option').should('be.visible');
    cySmartGet('buyField__selected-option-text').should('have.text', 'ETH');
  });

  describe('Buy field', () => {
    it('should show the right value and token if they are set in the params', () => {
      const params = {
        toContractAddress: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
        amount: '50000000000000000000',
        providerPreference: 'metamask',
      } as SwapWidgetParams;

      mount(
        <SwapWidget
          environment={Environment.PRODUCTION}
          params={params}
          theme={WidgetTheme.DARK}
        />
      );

      cySmartGet('buyField__option-ETH').should('not.exist');
      cySmartGet('buyField__option-IMX').should('not.exist');

      cySmartGet('buyField__amount__input').should('have.value', '50.0');
      cySmartGet('buyField__selected-option-text').should('have.text', 'IMX');
      cySmartGet('buyField__selected-option').click();

      cySmartGet('buyField__option-ETH').should('be.visible');
      cySmartGet('buyField__option-IMX').should('be.visible');

      cySmartGet('buyField__option-IMX').click();

      cySmartGet('buyField__option-ETH').should('not.exist');
      cySmartGet('buyField__option-IMX').should('not.exist');

      cySmartGet('buyField__selected-option-text').should('have.text', 'IMX');
    });
  });

  describe('With field', () => {
    it('should generate a quote based on the value in the Buy field', () => {
      const params = {
        toContractAddress: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
        amount: '50000000000000000000',
        providerPreference: 'metamask',
      } as SwapWidgetParams;

      mount(
        <SwapWidget
          environment={Environment.PRODUCTION}
          params={params}
          theme={WidgetTheme.DARK}
        />
      );

      cySmartGet('withField__option-ETH').should('not.exist');
      cySmartGet('withField__option-IMX').should('not.exist');
      cySmartGet('buyField__selected-option').click();

      cySmartGet('buyField__option-ETH').should('be.visible');
      cySmartGet('buyField__option-IMX').should('be.visible');

      cySmartGet('buyField__option-IMX').click();
      cy.wait(1000); //wait for the debounce delay
      cySmartGet('withField__amount__input').should('have.value', '500.0');
      cySmartGet('withField__selected-option-text').should('have.text', 'ETH');
    });
  });
});
