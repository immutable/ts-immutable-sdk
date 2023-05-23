import {
  describe, it, cy, beforeEach,
} from 'local-cypress';
import { mount } from 'cypress/react18';
import { ChainId, Checkout } from '@imtbl/checkout-sdk';
import { BigNumber } from 'ethers';
import { Environment } from '@imtbl/config';
import { cySmartGet } from '../../lib/testUtils';
import { SwapWidget, SwapWidgetParams } from './SwapWidget';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';
import { WidgetTheme } from '../../lib';

describe('SwapWidget tests', () => {
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
            // FIXME: stop hardcoding this, only doing because dev net is reset
            chainId: ChainId.POLYGON_ZKEVM_TESTNET,
            name: 'Ethereum',
          }),
          provider: {
            request: async () => null,
          },
        },
        network: {
          // FIXME: stop hardcoding this, only doing because dev net is reset
          chainId: ChainId.POLYGON_ZKEVM_TESTNET,
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
            },
          },
          {
            balance: BigNumber.from('10000000000000'),
            formattedBalance: '0.1',
            token: {
              name: 'ImmutableX',
              symbol: 'IMX',
              decimals: 18,
              address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
            },
          },
          {
            balance: BigNumber.from('100000000'),
            formattedBalance: '100',
            token: {
              name: 'USDCoin',
              symbol: 'USDC',
              decimals: 6,
              address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
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
            name: 'ImmutableX',
            symbol: 'IMX',
            decimals: 18,
            address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
          },
        ],
      });
  });

  it('should show swap widget on mount', () => {
    const params = {
      providerPreference: 'metamask',
    } as SwapWidgetParams;
    const config: StrongCheckoutWidgetsConfig = {
      environment: Environment.SANDBOX,
      theme: WidgetTheme.DARK,
      isBridgeEnabled: true,
      isSwapEnabled: true,
      isOnRampEnabled: true,
    };
    mount(
      <SwapWidget
        params={params}
        config={config}
      />,
    );

    cySmartGet('fromTokenInputs-select-form-select__target').should('be.visible');
    cySmartGet('fromTokenInputs-text-form-text').should('be.visible');
    cySmartGet('toTokenInputs-select-form-select__target').should('be.visible');
    cySmartGet('toTokenInputs-text-form-text').should('be.visible');
  });

  it('should set fromTokens to user balances filtered by the token allow list', () => {
    const params = {
      providerPreference: 'metamask',
    } as SwapWidgetParams;
    const config: StrongCheckoutWidgetsConfig = {
      environment: Environment.SANDBOX,
      theme: WidgetTheme.DARK,
      isBridgeEnabled: true,
      isSwapEnabled: true,
      isOnRampEnabled: true,
    };
    mount(
      <SwapWidget
        config={config}
        params={params}
      />,
    );

    cySmartGet('fromTokenInputs-select-form-select__target').click();
    // todo: eth not returning bc of the hardcoding with devnet reset
    // cySmartGet('fromTokenInputs-select-form-ETH-Ethereum').should('exist');
    cySmartGet('fromTokenInputs-select-form-IMX-ImmutableX').should('exist');
    cySmartGet('fromTokenInputs-select-form-USDC-USDCoin').should('not.exist');
  });

  // todo: implement below cypress tests in the slice tickets

  // describe('Buy field', () => {
  //   it('should show the right value and token if they are set in the params', () => {
  //     const params = {
  //       toContractAddress: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
  //       amount: '50000000000000000000',
  //       providerPreference: 'metamask',
  //     } as SwapWidgetParams;

  //     mount(
  //       <SwapWidget
  //         environment={Environment.PRODUCTION}
  //         params={params}
  //         theme={WidgetTheme.DARK}
  //       />
  //     );

  //     cySmartGet('buyField__option-ETH').should('not.exist');
  //     cySmartGet('buyField__option-IMX').should('not.exist');

  //     cySmartGet('buyField__amount__input').should('have.value', '50.0');
  //     cySmartGet('buyField__selected-option-text').should('have.text', 'IMX');
  //     cySmartGet('buyField__selected-option').click();

  //     cySmartGet('buyField__option-ETH').should('be.visible');
  //     cySmartGet('buyField__option-IMX').should('be.visible');

  //     cySmartGet('buyField__option-IMX').click();

  //     cySmartGet('buyField__option-ETH').should('not.exist');
  //     cySmartGet('buyField__option-IMX').should('not.exist');

  //     cySmartGet('buyField__selected-option-text').should('have.text', 'IMX');
  //   });
  // });

  // describe('With field', () => {
  //   it('should generate a quote based on the value in the Buy field', () => {
  //     const params = {
  //       toContractAddress: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
  //       amount: '50000000000000000000',
  //       providerPreference: 'metamask',
  //     } as SwapWidgetParams;

  //     mount(
  //       <SwapWidget
  //         environment={Environment.PRODUCTION}
  //         params={params}
  //         theme={WidgetTheme.DARK}
  //       />
  //     );

  //     cySmartGet('withField__option-ETH').should('not.exist');
  //     cySmartGet('withField__option-IMX').should('not.exist');
  //     cySmartGet('buyField__selected-option').click();

  //     cySmartGet('buyField__option-ETH').should('be.visible');
  //     cySmartGet('buyField__option-IMX').should('be.visible');

  //     cySmartGet('buyField__option-IMX').click();
  //     cy.wait(1000); //wait for the debounce delay
  //     cySmartGet('withField__amount__input').should('have.value', '500.0');
  //     cySmartGet('withField__selected-option-text').should('have.text', 'ETH');
  //   });
  // });
});
