import {
  describe, it, cy, beforeEach,
} from 'local-cypress';
import { mount } from 'cypress/react18';
import { BigNumber } from 'ethers';
import { cySmartGet } from '../../../lib/testUtils';
import { SwapWidgetTestComponent } from '../test-components/SwapWidgetTestComponent';
import { SwapCoins } from './SwapCoins';
import { SwapState } from '../context/SwapContext';

describe('SwapCoins tests', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
  });

  let cryptoConversions;
  beforeEach(() => {
    cryptoConversions = new Map<string, number>([['eth', 1800], ['imx', 0.75]]);
    const initialSwapState: SwapState = {
      checkout: null,
      exchange: null,
      provider: null,
      walletProvider: null,
      network: null,
      tokenBalances: [
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
      supportedTopUps: null,
      allowedTokens: [
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
    };

    mount(
      <SwapWidgetTestComponent
        initialStateOverride={initialSwapState}
        cryptoConversionsOverride={cryptoConversions}
      >
        <SwapCoins />
      </SwapWidgetTestComponent>,
    );
  });

  it('should only allow valid number up to 6 decimal places in from field', () => {
    cySmartGet('fromTokenInputs-text-form-text__input').focus().type('1234567');
    cySmartGet('fromTokenInputs-text-form-text__input').should('have.value', '1234567');
    cySmartGet('fromTokenInputs-text-form-text__input').clear();
    cySmartGet('fromTokenInputs-text-form-text__input').focus().type('12.123e4');
    cySmartGet('fromTokenInputs-text-form-text__input').should('have.value', '12.1234');
    cySmartGet('fromTokenInputs-text-form-text__input').clear();
    cySmartGet('fromTokenInputs-text-form-text__input').focus().type('12.1234567');
    cySmartGet('fromTokenInputs-text-form-text__input').should('have.value', '12.123456');
  });

  it('should only allow valid number up to 6 decimal places in to field', () => {
    cySmartGet('toTokenInputs-text-form-text__input').focus().type('1234567');
    cySmartGet('toTokenInputs-text-form-text__input').should('have.value', '1234567');
    cySmartGet('toTokenInputs-text-form-text__input').clear();

    cySmartGet('toTokenInputs-text-form-text__input').focus().type('12.123e4');
    cySmartGet('toTokenInputs-text-form-text__input').should('have.value', '12.1234');
    cySmartGet('toTokenInputs-text-form-text__input').clear();

    cySmartGet('toTokenInputs-text-form-text__input').focus().type('12.1234567');
    cySmartGet('toTokenInputs-text-form-text__input').should('have.value', '12.123456');
  });

  it('should show token balances list in from select', () => {
    cySmartGet('fromTokenInputs-select-form-select__target').click();
    cySmartGet('fromTokenInputs-select-form-coin-selector__option-imx-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff')
      .should('be.visible');
    cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth').should('not.exist');
    cySmartGet('fromTokenInputs-select-form-coin-selector__option-imx-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff')
      .click();
    cySmartGet('fromTokenInputs-select-form-select__target')
      .find('span')
      .should('have.text', 'IMX');
  });

  it('should show allowed tokens list in to select', () => {
    cySmartGet('toTokenInputs-select-form-select__target').click();
    cySmartGet('toTokenInputs-select-form-coin-selector__option-eth').should('be.visible');
    cySmartGet('toTokenInputs-select-form-coin-selector__option-imx-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff')
      .should('be.visible');
    cySmartGet('toTokenInputs-select-form-coin-selector__option-eth').click();
    cySmartGet('toTokenInputs-select-form-select__target')
      .find('span')
      .should('have.text', 'ETH');
    cySmartGet('toTokenInputs-select-form-IMX-IMX').should('not.exist');
  });
});
