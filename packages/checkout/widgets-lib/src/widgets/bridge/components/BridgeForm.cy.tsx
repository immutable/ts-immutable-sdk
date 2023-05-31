import { mount } from 'cypress/react18';
import { cy, describe } from 'local-cypress';
import { BigNumber } from 'ethers';
import { BridgeWidgetTestComponent } from '../test-components/BridgeWidgetTestComponent';
import { Bridge } from '../views/Bridge';
import { cySmartGet } from '../../../lib/testUtils';
import { text } from '../../../resources/text/textConfig';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';

describe('Bridge Form', () => {
  const { validation } = text.views[BridgeWidgetViews.BRIDGE];
  let initialBridgeState;
  let cryptoConversions;
  beforeEach(() => {
    cy.viewport('ipad-2');

    cryptoConversions = new Map<string, number>([['eth', 1800], ['imx', 0.75]]);
    initialBridgeState = {
      checkout: null,
      exchange: null,
      provider: null,
      providerPreference: null,
      network: null,
      tokenBalances: [
        {
          balance: BigNumber.from('100000000000000000'),
          formattedBalance: '0.1',
          token: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
          },
        },
        {
          balance: BigNumber.from('100000000000000000'),
          formattedBalance: '0.1',
          token: {
            name: 'IMX',
            symbol: 'IMX',
            decimals: 18,
            address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
          },
        },
        {
          balance: BigNumber.from('0'),
          formattedBalance: '0',
          token: {
            name: 'RandomAllowedToken',
            symbol: 'RANDA',
            decimals: 18,
            address: '0x11111e7C23978C3cAEC3C3548E3D615c11111111',
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
        {
          name: 'RandomAllowedToken',
          symbol: 'RANDA',
          decimals: 18,
          address: '0x11111e7C23978C3cAEC3C3548E3D615c11111111',
        },
        {
          name: 'SecondAllowedToken',
          symbol: 'SEC',
          decimals: 18,
          address: '0x22222e7C23978C3cAEC3C3548E3D615c22222222',
        },
      ],
    };
  });

  describe('Bridge Form behaviour', () => {
    it('should render the bridge form with initial values', () => {
      mount(
        <BridgeWidgetTestComponent
          initialStateOverride={initialBridgeState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <Bridge amount="" fromContractAddress="" />
        </BridgeWidgetTestComponent>,
      );

      cySmartGet('bridge-token-select__target').should('have.text', 'Select coin');
      cySmartGet('bridge-amount-text__input').should('have.value', '');
    });

    it('should render the bridge form with provided default amount', () => {
      mount(
        <BridgeWidgetTestComponent
          initialStateOverride={initialBridgeState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <Bridge amount="0.1" fromContractAddress="" />
        </BridgeWidgetTestComponent>,
      );

      cySmartGet('bridge-token-select__target').should('have.text', 'Select coin');
      cySmartGet('bridge-amount-text__input').should('have.value', '0.1');
    });

    it('should render the bridge form with default token', () => {
      mount(
        <BridgeWidgetTestComponent
          initialStateOverride={initialBridgeState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <Bridge amount="0.1" fromContractAddress="0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF" />
        </BridgeWidgetTestComponent>,
      );

      cySmartGet('bridge-token-select__target__controlledLabel').should('have.text', 'IMX');
    });

    it('should render token balances greater than zero as token options', () => {
      mount(
        <BridgeWidgetTestComponent
          initialStateOverride={initialBridgeState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <Bridge amount="" fromContractAddress="" />
        </BridgeWidgetTestComponent>,
      );

      cySmartGet('bridge-token-select__target').click();
      cySmartGet('bridge-token-ETH-Ethereum').should('exist');
      cySmartGet('bridge-token-IMX-IMX').should('exist');
      cySmartGet('bridge-token-RANDA-RandomAllowedToken').should('not.exist');
    });

    it('should only render token balances as token options not all of the allowed tokens', () => {
      mount(
        <BridgeWidgetTestComponent
          initialStateOverride={initialBridgeState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <Bridge amount="" fromContractAddress="" />
        </BridgeWidgetTestComponent>,
      );

      cySmartGet('bridge-token-select__target').click();
      cySmartGet('bridge-token-ETH-Ethereum').should('exist');
      cySmartGet('bridge-token-IMX-IMX').should('exist');
      cySmartGet('bridge-token-SEC-SecondAllowedToken').should('not.exist');
    });

    it('should update the token when changed', () => {
      mount(
        <BridgeWidgetTestComponent
          initialStateOverride={initialBridgeState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <Bridge amount="" fromContractAddress="" />
        </BridgeWidgetTestComponent>,
      );

      cySmartGet('bridge-token-select__target').click();
      cySmartGet('bridge-token-ETH-Ethereum').click();
      cySmartGet('bridge-token-select__target').should('have.text', 'ETH');
    });

    it('should show available balance when token is chosen', () => {
      mount(
        <BridgeWidgetTestComponent
          initialStateOverride={initialBridgeState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <Bridge amount="" fromContractAddress="" />
        </BridgeWidgetTestComponent>,
      );

      cySmartGet('bridge-token-select__target').click();
      cySmartGet('bridge-token-ETH-Ethereum').click();
      cySmartGet('bridge-token-select__target').should('have.text', 'ETH');
      cySmartGet('bridge-token-select-control-subtext')
        .should('have.text', 'Available 0.1');
    });

    it('should show fiat equivalent amount when amount is changed', () => {
      mount(
        <BridgeWidgetTestComponent
          initialStateOverride={initialBridgeState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <Bridge amount="" fromContractAddress="" />
        </BridgeWidgetTestComponent>,
      );

      cySmartGet('bridge-token-select__target').click();
      cySmartGet('bridge-token-ETH-Ethereum').click();
      cySmartGet('bridge-amount-text-control-subtext')
        .should('have.text', 'Approx USD $-.--');
      cySmartGet('bridge-amount-text__input').type('0.1');
      cySmartGet('bridge-amount-text-control-subtext')
        .should('have.text', 'Approx USD $180.00');
    });
  });

  describe('Bridge From validations', () => {
    it('should set validations on token and amount if move is clicked on inital state', () => {
      mount(
        <BridgeWidgetTestComponent
          initialStateOverride={initialBridgeState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <Bridge amount="" fromContractAddress="" />
        </BridgeWidgetTestComponent>,
      );
      cySmartGet('bridge-form-button').click();
      cySmartGet('bridge-token-select-control-error')
        .should('exist')
        .should('have.text', validation.noTokenSelected);

      cySmartGet('bridge-amount-text-control-error')
        .should('exist')
        .should('have.text', validation.noAmountInputted);
    });

    it('should remove validations on token and amount if valid values are input', () => {
      mount(
        <BridgeWidgetTestComponent
          initialStateOverride={initialBridgeState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <Bridge amount="" fromContractAddress="" />
        </BridgeWidgetTestComponent>,
      );
      cySmartGet('bridge-form-button').click();
      cySmartGet('bridge-token-select-control-error')
        .should('exist')
        .should('have.text', validation.noTokenSelected);

      cySmartGet('bridge-amount-text-control-error')
        .should('exist')
        .should('have.text', validation.noAmountInputted);

      cySmartGet('bridge-token-select__target').click();
      cySmartGet('bridge-token-ETH-Ethereum').click();
      cySmartGet('bridge-token-select-control-error').should('not.exist');

      cySmartGet('bridge-amount-text__input').type('0.1');
      cySmartGet('bridge-amount-text-control-error').should('not.exist');
    });

    it('should show insufficient balance error if amount input is greater than available balance', () => {
      mount(
        <BridgeWidgetTestComponent
          initialStateOverride={initialBridgeState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <Bridge amount="" fromContractAddress="" />
        </BridgeWidgetTestComponent>,
      );

      cySmartGet('bridge-token-select__target').click();
      cySmartGet('bridge-token-ETH-Ethereum').click();

      cySmartGet('bridge-amount-text__input').type('2');
      cySmartGet('bridge-form-button').click();

      cySmartGet('bridge-amount-text-control-error')
        .should('exist')
        .should('have.text', validation.insufficientBalance);
    });
  });
});
