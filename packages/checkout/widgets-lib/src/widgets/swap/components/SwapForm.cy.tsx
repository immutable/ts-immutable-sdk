import { mount } from 'cypress/react18';
import { BigNumber } from 'ethers';
import { cy } from 'local-cypress';
import { Web3Provider } from '@ethersproject/providers';
import { Checkout, CheckoutErrorType } from '@imtbl/checkout-sdk';
import { Exchange } from '@imtbl/dex-sdk';
import { cyIntercept, cySmartGet } from '../../../lib/testUtils';
import { SwapWidgetTestComponent } from '../test-components/SwapWidgetTestComponent';
import { SwapForm } from './SwapForm';
import { text } from '../../../resources/text/textConfig';
import { SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import { SwapState, initialSwapState } from '../context/SwapContext';
import { SwapCoins } from '../views/SwapCoins';
import { quotesProcessor } from '../functions/FetchQuote';

describe('SwapForm', () => {
  let testSwapState: SwapState;
  let cryptoConversions;

  beforeEach(() => {
    cy.viewport('ipad-2');
    cyIntercept();

    cryptoConversions = new Map<string, number>([['eth', 1800], ['imx', 0.75]]);

    testSwapState = {
      ...initialSwapState,
      provider: {} as Web3Provider,
      checkout: new Checkout(),
      exchange: {} as Exchange,
      tokenBalances: [
        {
          balance: BigNumber.from('10000000000000'),
          formattedBalance: '0.1',
          token: {
            name: 'ImmutableX',
            symbol: 'IMX',
            decimals: 18,
            address: '',
          },
        },
        {
          balance: BigNumber.from('10000000000000'),
          formattedBalance: '0.1',
          token: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18,
            address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
          },
        },
      ],
      allowedTokens: [
        {
          name: 'ImmutableX',
          symbol: 'IMX',
          decimals: 18,
          address: '',
        },
        {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
          address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
        },
      ],
    };
  });
  const { swapForm: { from: fromText, to: toText }, validation } = text.views[SwapWidgetViews.SWAP];

  describe('initial form state', () => {
    it('should show all swap inputs with initial state', () => {
      mount(
        <SwapWidgetTestComponent
          initialStateOverride={testSwapState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <SwapForm />
        </SwapWidgetTestComponent>,
      );
      cySmartGet('fromTokenInputs-select-form-select__target').should('be.visible');
      cySmartGet('fromTokenInputs-select-form-select__target').should('have.text', 'Select coin');
      cySmartGet('fromTokenInputs-text-form-text')
        .should('be.visible');
      cySmartGet('fromTokenInputs-text-form-text__input')
        .should('have.attr', 'placeholder', fromText.inputPlaceholder);
      cySmartGet('toTokenInputs-select-form-select__target').should('be.visible');
      cySmartGet('toTokenInputs-select-form-select__target').should('have.text', 'Select coin');
      cySmartGet('toTokenInputs-text-form-text').should('be.visible');
      cySmartGet('toTokenInputs-text-form-text__input').should('have.attr', 'placeholder', toText.inputPlaceholder);
    });

    it('should set native token as from if native token is provided in from address', () => {
      mount(
        <SwapWidgetTestComponent
          initialStateOverride={testSwapState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <SwapForm data={{
            fromContractAddress: 'NATIVE',
          }}
          />
        </SwapWidgetTestComponent>,
      );

      cySmartGet('fromTokenInputs-select-form-select__target').should('be.visible');
      cySmartGet('fromTokenInputs-select-form-select__target').should('have.text', 'IMX');
    });

    it('should set native token as to if native token is provided in to address', () => {
      mount(
        <SwapWidgetTestComponent
          initialStateOverride={testSwapState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <SwapForm data={{
            toContractAddress: 'NATIVE',
          }}
          />
        </SwapWidgetTestComponent>,
      );

      cySmartGet('toTokenInputs-select-form-select__target').should('be.visible');
      cySmartGet('toTokenInputs-select-form-select__target').should('have.text', 'IMX');
    });

    it('should set from token matching the from token address provided', () => {
      mount(
        <SwapWidgetTestComponent
          initialStateOverride={testSwapState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <SwapForm data={{
            fromContractAddress: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
          }}
          />
        </SwapWidgetTestComponent>,
      );

      cySmartGet('fromTokenInputs-select-form-select__target').should('be.visible');
      cySmartGet('fromTokenInputs-select-form-select__target').should('have.text', 'ETH');
    });

    it('should set to token matching the to token address provided', () => {
      mount(
        <SwapWidgetTestComponent
          initialStateOverride={testSwapState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <SwapForm data={{
            toContractAddress: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
          }}
          />
        </SwapWidgetTestComponent>,
      );

      cySmartGet('toTokenInputs-select-form-select__target').should('be.visible');
      cySmartGet('toTokenInputs-select-form-select__target').should('have.text', 'ETH');
    });

    it('should set both from and to token when token addresses are unique', () => {
      mount(
        <SwapWidgetTestComponent
          initialStateOverride={testSwapState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <SwapForm data={{
            fromContractAddress: 'NATIVE',
            toContractAddress: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
          }}
          />
        </SwapWidgetTestComponent>,
      );

      cySmartGet('fromTokenInputs-select-form-select__target').should('be.visible');
      cySmartGet('fromTokenInputs-select-form-select__target').should('have.text', 'IMX');
      cySmartGet('toTokenInputs-select-form-select__target').should('be.visible');
      cySmartGet('toTokenInputs-select-form-select__target').should('have.text', 'ETH');
    });

    it('should set only from token when to and from token addresses match', () => {
      mount(
        <SwapWidgetTestComponent
          initialStateOverride={testSwapState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <SwapForm data={{
            fromContractAddress: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
            toContractAddress: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
          }}
          />
        </SwapWidgetTestComponent>,
      );

      cySmartGet('fromTokenInputs-select-form-select__target').should('be.visible');
      cySmartGet('fromTokenInputs-select-form-select__target').should('have.text', 'ETH');
      cySmartGet('toTokenInputs-select-form-select__target').should('be.visible');
      cySmartGet('toTokenInputs-select-form-select__target').should('have.text', 'Select coin');
    });
  });

  describe('swapFromAmount input validation', () => {
    const swapFromAmountTestCases = [
      {
        name: 'should allow for numbers and decimal place',
        input: '123.4',
        expected: '123.4',
      },
      {
        name: 'should allow only one decimal place',
        input: '123.4.3',
        expected: '123.43',
      },
      {
        name: 'should allow for decimal place with 6 decimals',
        input: '123.123456',
        expected: '123.123456',
      },
      {
        name: 'should not allow any alpha character inputs',
        input: 'abc',
        expected: '',
      },
      {
        name: 'should not allow spaces',
        input: '   ',
        expected: '',
      },
      {
        name: 'should not allow spaces 2',
        input: '123   .456',
        expected: '123.456',
      },
      {
        name: 'should not allow special characters',
        input: '!@#$%^&*()',
        expected: '',
      },
      {
        name: 'should only keep numeric values from alpha numeric input',
        input: '123a',
        expected: '123',
      },
      {
        name: 'should only keep numeric values from alpha numeric input 2',
        input: '123a4',
        expected: '1234',
      },
      {
        name: 'should truncate to 6 if more than 6 decimals typed',
        input: '123.123456789',
        expected: '123.123456',
      },
      {
        name: 'should not allow decimal place to start',
        input: '.1',
        expected: '1',
      },
      {
        name: 'should force number before decimal place',
        input: '0.1',
        expected: '0.1',
      },
    ];
    swapFromAmountTestCases.forEach((testCase) => {
      it(`should only allow numbers with 6 decimal places in the swapFromAmount input - ${testCase.name}`, () => {
        mount(
          <SwapWidgetTestComponent>
            <SwapForm />
          </SwapWidgetTestComponent>,
        );

        // Have had to modify the onChange method to reset to previous state if input is not valid
        cySmartGet('fromTokenInputs-text-form-text__input').type(testCase.input).trigger('change');
        cySmartGet('fromTokenInputs-text-form-text__input').should('have.attr', 'value', testCase.expected);
      });
    });
  });

  describe('swap form behaviour', () => {
    it('should validate all inputs when Swap Button is clicked', () => {
      mount(
        <SwapWidgetTestComponent
          initialStateOverride={testSwapState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <SwapCoins />
        </SwapWidgetTestComponent>,
      );

      cySmartGet('swap-button').click();

      cySmartGet('fromTokenInputs-select-form-select-control-error')
        .should('exist')
        .should('have.text', validation.noFromTokenSelected);

      cySmartGet('fromTokenInputs-text-form-text-control-error')
        .should('exist')
        .should('have.text', validation.noAmountInputted);

      cySmartGet('toTokenInputs-select-form-select-control-error')
        .should('exist')
        .should('have.text', validation.noToTokenSelected);

      cySmartGet('toTokenInputs-text-form-text-control-error')
        .should('exist')
        .should('have.text', validation.noAmountInputted);
    });

    it('should show insufficient balance error when swap from amount is larger than token balance', () => {
      mount(
        <SwapWidgetTestComponent
          initialStateOverride={testSwapState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <SwapCoins />
        </SwapWidgetTestComponent>,
      );

      cySmartGet('fromTokenInputs-select-form-select__target').click();
      cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff')
        .click();
      cySmartGet('fromTokenInputs-text-form-text__input').type('20').trigger('change');

      cySmartGet('swap-button').click();

      cySmartGet('fromTokenInputs-text-form-text-control-error')
        .should('exist')
        .should('have.text', validation.insufficientBalance);
    });

    it('should show no amount error when swap from amount missing', () => {
      mount(
        <SwapWidgetTestComponent
          initialStateOverride={testSwapState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <SwapCoins />
        </SwapWidgetTestComponent>,
      );

      cySmartGet('fromTokenInputs-select-form-select__target').click();
      cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff')
        .click();

      cySmartGet('swap-button').click();

      cySmartGet('fromTokenInputs-text-form-text-control-error')
        .should('exist')
        .should('have.text', validation.noAmountInputted);
    });

    it('should remove validation error when swap from amount is fixed', () => {
      mount(
        <SwapWidgetTestComponent
          initialStateOverride={testSwapState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <SwapCoins />
        </SwapWidgetTestComponent>,
      );

      cySmartGet('fromTokenInputs-select-form-select__target').click();
      cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff')
        .click();

      cySmartGet('swap-button').click();
      cySmartGet('fromTokenInputs-text-form-text-control-error')
        .should('exist')
        .should('have.text', validation.noAmountInputted);

      cySmartGet('fromTokenInputs-text-form-text__input').type('0.01').blur();

      cySmartGet('fromTokenInputs-text-form-text-control-error')
        .should('not.exist');
    });

    it('should remove validation error when swap from token is chosen', () => {
      mount(
        <SwapWidgetTestComponent
          initialStateOverride={testSwapState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <SwapCoins />
        </SwapWidgetTestComponent>,
      );

      cySmartGet('toTokenInputs-select-form-select__target').click();
      cySmartGet('toTokenInputs-select-form-coin-selector__option-imx').click();
      cySmartGet('fromTokenInputs-text-form-text__input').type('0.01').blur();
      cySmartGet('swap-button').click();
      cySmartGet('fromTokenInputs-select-form-select-control-error')
        .should('exist')
        .should('have.text', validation.noFromTokenSelected);

      cySmartGet('fromTokenInputs-select-form-select__target').click();
      cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff')
        .click();

      cySmartGet('fromTokenInputs-text-form-text-control-error')
        .should('not.exist');
    });
  });

  describe('when to fetch a quote', () => {
    beforeEach(() => {
      cy.stub(quotesProcessor, 'fromAmountIn')
        .as('fromAmountInStub')
        .resolves({
          quote: {
            amount: {
              token: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
                address: '',
              },
              value: BigNumber.from('112300000000000012'),
            },
            amountWithMaxSlippage: {
              token: {
                name: 'ImmutableX',
                symbol: 'IMX',
                decimals: 18,
                address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
              },
              value: BigNumber.from('112300000000000032'),
            },
            slippage: 10,
          },
          swap: {
            gasFeeEstimate: {
              token: {
                name: 'ImmutableX',
                symbol: 'IMX',
                decimals: 18,
                address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
              },
              value: BigNumber.from('112300000000000045'),
            },
            transaction: {
              to: 'toSwapAddress',
              from: 'fromSwapAddress',
            },
          },
          approval: {
            gasFeeEstimate: {
              token: {
                name: 'ImmutableX',
                symbol: 'IMX',
                decimals: 18,
                address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
              },
              amount: BigNumber.from('112300000000000045'),
            },
            transaction: {
              to: 'toApprovalAddress',
              from: 'fromApprovalAddress',
            },
          },
        });
    });

    it('should only fetch a quote when from token and to token are selected and swap amount has value', () => {
      mount(
        <SwapWidgetTestComponent
          initialStateOverride={testSwapState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <SwapCoins />
        </SwapWidgetTestComponent>,
      );

      cySmartGet('fromTokenInputs-select-form-select__target').click();
      cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff')
        .click();
      cySmartGet('toTokenInputs-select-form-select__target').click();
      cySmartGet('toTokenInputs-select-form-coin-selector__option-imx').click();
      cySmartGet('fromTokenInputs-text-form-text__input').type('0.01').trigger('change');
      cySmartGet('fromTokenInputs-text-form-text__input').blur();

      const params = [
        // exchange
        {},
        // provider
        {},
        // fromToken
        {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
          address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
        },
        // fromAmount
        '0.01',
        // toToken
        {
          name: 'ImmutableX',
          symbol: 'IMX',
          decimals: 18,
          address: '',
        },
      ];
      cySmartGet('@fromAmountInStub').should('have.been.calledWith', ...params);
    });

    it('should set to amount and fees after quote is fetched', () => {
      mount(
        <SwapWidgetTestComponent
          initialStateOverride={testSwapState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <SwapCoins />
        </SwapWidgetTestComponent>,
      );

      cySmartGet('fromTokenInputs-select-form-select__target').click();
      cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff')
        .click();
      cySmartGet('toTokenInputs-select-form-select__target').click();
      cySmartGet('toTokenInputs-select-form-coin-selector__option-imx').click();
      cySmartGet('fromTokenInputs-text-form-text__input').type('0.01').trigger('change');
      cySmartGet('fromTokenInputs-text-form-text__input').blur();
      cySmartGet('@fromAmountInStub').should('have.been.called');

      const params = [
        // exchange
        {},
        // provider
        {},
        // fromToken
        {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
          address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
        },
        // fromAmount
        '0.01',
        // toToken
        {
          name: 'ImmutableX',
          symbol: 'IMX',
          decimals: 18,
          address: '',
        },
      ];
      cySmartGet('@fromAmountInStub').should('have.been.calledWith', ...params);

      const staticText = text.views[SwapWidgetViews.SWAP];
      cySmartGet('fee_description_gas').should('have.text', '≈ IMX 0.112300');
      cySmartGet('fee_description_gas_fiat').should('have.text', `${staticText.content.fiatPricePrefix} $0.08`);
    });

    it('should fetch a quote after from amount max button is clicked', () => {
      mount(
        <SwapWidgetTestComponent
          initialStateOverride={testSwapState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <SwapCoins />
        </SwapWidgetTestComponent>,
      );

      cySmartGet('fromTokenInputs-select-form-select__target').click();
      cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff')
        .click();
      cySmartGet('toTokenInputs-select-form-select__target').click();
      cySmartGet('toTokenInputs-select-form-coin-selector__option-imx').click();
      cySmartGet('fromTokenInputs-text-form-max-button').click();

      const params = [
        // exchange
        {},
        // provider
        {},
        // fromToken
        {
          name: 'Ethereum',
          symbol: 'ETH',
          decimals: 18,
          address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
        },
        // fromAmount
        '0.1', // From balance
        // toToken
        {
          name: 'ImmutableX',
          symbol: 'IMX',
          decimals: 18,
          address: '',
        },
      ];

      cySmartGet('@fromAmountInStub').should('have.been.calledWith', ...params);
    });

    it('should not fetch a quote when to token is not selected', () => {
      mount(
        <SwapWidgetTestComponent
          initialStateOverride={testSwapState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <SwapCoins />
        </SwapWidgetTestComponent>,
      );

      cySmartGet('fromTokenInputs-select-form-select__target').click();
      cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff')
        .click();
      cySmartGet('fromTokenInputs-text-form-text__input').type('0.01').trigger('change');
      cySmartGet('@fromAmountInStub').should('not.have.been.called');

      cySmartGet('toTokenInputs-select-form-select__target').click();
      cySmartGet('toTokenInputs-select-form-coin-selector__option-imx').click();
      cySmartGet('@fromAmountInStub').should('have.been.called');
    });

    it('should not fetch a quote when from token is not selected', () => {
      mount(
        <SwapWidgetTestComponent
          initialStateOverride={testSwapState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <SwapCoins />
        </SwapWidgetTestComponent>,
      );

      cySmartGet('toTokenInputs-select-form-select__target').click();
      cySmartGet('toTokenInputs-select-form-coin-selector__option-imx').click();
      cySmartGet('fromTokenInputs-text-form-text__input').type('0.01').trigger('change');
      cySmartGet('@fromAmountInStub').should('not.have.been.called');

      cySmartGet('fromTokenInputs-select-form-select__target').click();
      cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff')
        .click();
      cySmartGet('@fromAmountInStub').should('have.been.called');
    });

    it('should not fetch a quote when from amount is 0', () => {
      mount(
        <SwapWidgetTestComponent
          initialStateOverride={testSwapState}
          cryptoConversionsOverride={cryptoConversions}
        >
          <SwapCoins />
        </SwapWidgetTestComponent>,
      );

      cySmartGet('fromTokenInputs-select-form-select__target').click();
      cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff')
        .click();
      cySmartGet('toTokenInputs-select-form-select__target').click();
      cySmartGet('toTokenInputs-select-form-coin-selector__option-imx').click();
      cySmartGet('fromTokenInputs-text-form-text__input').type('0').trigger('change');
      cySmartGet('@fromAmountInStub').should('not.have.been.called');

      cySmartGet('fromTokenInputs-text-form-text__input').type('0.01').trigger('change');
      cySmartGet('fromTokenInputs-text-form-text__input').type('0.01').blur();
      cySmartGet('@fromAmountInStub').should('have.been.called');
    });
  });

  describe('submitting a swap', () => {
    describe('dex success', () => {
      beforeEach(() => {
        cy.stub(quotesProcessor, 'fromAmountIn')
          .as('fromAmountInStub')
          .resolves({
            quote: {
              amount: {
                token: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                  address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
                },
                value: BigNumber.from('112300000000000012'),
              },
              amountWithMaxSlippage: {
                token: {
                  name: 'ImmutableX',
                  symbol: 'IMX',
                  decimals: 18,
                  address: '',
                },
                value: BigNumber.from('112300000000000032'),
              },
              slippage: 10,
            },
            swap: {
              gasFeeEstimate: {
                token: {
                  name: 'ImmutableX',
                  symbol: 'IMX',
                  decimals: 18,
                  address: '',
                },
                value: BigNumber.from('100000000000000'),
              },
              transaction: {
                to: 'toSwapAddress',
                from: 'fromSwapAddress',
              },
            },
          });
        cy.stub(quotesProcessor, 'fromAmountOut')
          .as('fromAmountOutStub')
          .resolves({
            quote: {
              amount: {
                token: {
                  name: 'ImmutableX',
                  symbol: 'IMX',
                  decimals: 18,
                  address: '',
                },
                value: BigNumber.from('100000000000000'),
              },
              amountWithMaxSlippage: {
                token: {
                  name: 'ImmutableX',
                  symbol: 'IMX',
                  decimals: 18,
                  address: '',
                },
                value: BigNumber.from('100000000000000000'),
              },
              slippage: 10,
            },
            swap: {
              gasFeeEstimate: {
                token: {
                  name: 'ImmutableX',
                  symbol: 'IMX',
                  decimals: 18,
                  address: '',
                },
                value: BigNumber.from('100000000000000'),
              },
              transaction: {
                to: 'toSwapAddress',
                from: 'fromSwapAddress',
              },
            },
          });
      });

      it('should open the transaction rejected drawer if the user rejects the transaction', () => {
        cy.stub(Checkout.prototype, 'sendTransaction').as('sendTransactionStub')
          .rejects({
            type: CheckoutErrorType.USER_REJECTED_REQUEST_ERROR,
          });

        mount(
          <SwapWidgetTestComponent
            initialStateOverride={{
              ...testSwapState,
              tokenBalances: [
                {
                  balance: BigNumber.from('1000000000000000000'),
                  formattedBalance: '1',
                  token: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18,
                    address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
                  },
                },
                {
                  balance: BigNumber.from('1000000000000000000'),
                  formattedBalance: '1',
                  token: {
                    name: 'ImmutableX',
                    symbol: 'IMX',
                    decimals: 18,
                    address: '',
                  },
                },
              ],
            }}
            cryptoConversionsOverride={cryptoConversions}
          >
            <SwapCoins />
          </SwapWidgetTestComponent>,
        );

        cySmartGet('fromTokenInputs-select-form-select__target').click();
        cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff')
          .click();
        cySmartGet('toTokenInputs-select-form-select__target').click();
        cySmartGet('toTokenInputs-select-form-coin-selector__option-imx').click();

        cySmartGet('fromTokenInputs-text-form-text__input').type('0.1').trigger('change');
        cySmartGet('fromTokenInputs-text-form-text__input').blur();

        cySmartGet('swap-button').click();

        cySmartGet('transaction-rejected-heading').should('be.visible');
      });

      it('should show not enough imx drawer if user does not have enough imx', () => {
        mount(
          <SwapWidgetTestComponent
            initialStateOverride={{
              ...testSwapState,
              tokenBalances: [
                {
                  balance: BigNumber.from('1000000000000000000'),
                  formattedBalance: '1',
                  token: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18,
                    address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
                  },
                },
                {
                  balance: BigNumber.from('100000'),
                  formattedBalance: '0.0001',
                  token: {
                    name: 'ImmutableX',
                    symbol: 'IMX',
                    decimals: 18,
                    address: '',
                  },
                },
              ],
            }}
            cryptoConversionsOverride={cryptoConversions}
          >
            <SwapCoins />
          </SwapWidgetTestComponent>,
        );

        cySmartGet('fromTokenInputs-select-form-select__target').click();
        cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff')
          .click();
        cySmartGet('toTokenInputs-select-form-select__target').click();
        cySmartGet('toTokenInputs-select-form-coin-selector__option-imx').click();

        cySmartGet('fromTokenInputs-text-form-text__input').type('0.00001').trigger('change');
        cySmartGet('fromTokenInputs-text-form-text__input').blur();

        cySmartGet('swap-button').click();

        cySmartGet('not-enough-gas-bottom-sheet').should('be.visible');
        cySmartGet('not-enough-gas-add-imx-button').should('be.visible');
        cySmartGet('not-enough-gas-cancel-button').should('be.visible');
        cySmartGet('not-enough-gas-adjust-amount-button').should('not.exist');
      });

      it('should show adjust button if user does not have enough imx and imx is in from', () => {
        mount(
          <SwapWidgetTestComponent
            initialStateOverride={{
              ...testSwapState,
              tokenBalances: [
                {
                  balance: BigNumber.from('1000000000000000000'),
                  formattedBalance: '1',
                  token: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18,
                    address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
                  },
                },
                {
                  balance: BigNumber.from('100000'),
                  formattedBalance: '0.0001',
                  token: {
                    name: 'ImmutableX',
                    symbol: 'IMX',
                    decimals: 18,
                    address: '',
                  },
                },
              ],
            }}
            cryptoConversionsOverride={cryptoConversions}
          >
            <SwapCoins />
          </SwapWidgetTestComponent>,
        );

        cySmartGet('toTokenInputs-select-form-select__target').click();
        cySmartGet('toTokenInputs-select-form-coin-selector__option-eth-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff')
          .click();
        cySmartGet('fromTokenInputs-select-form-select__target').click();
        cySmartGet('fromTokenInputs-select-form-coin-selector__option-imx').click();

        cySmartGet('toTokenInputs-text-form-text__input').type('0.00001').trigger('change');
        cySmartGet('toTokenInputs-text-form-text__input').blur();

        cySmartGet('swap-button').click();

        cySmartGet('not-enough-gas-bottom-sheet').should('be.visible');
        cySmartGet('not-enough-gas-add-imx-button').should('be.visible');
        cySmartGet('not-enough-gas-cancel-button').should('be.visible');
        cySmartGet('not-enough-gas-adjust-amount-button').should('be.visible');

        cySmartGet('not-enough-gas-adjust-amount-button').click();
        cySmartGet('not-enough-gas-bottom-sheet').should('not.exist');
      });

      it('should show loading if user has enough imx and does not reject the transaction', () => {
        cy.stub(Checkout.prototype, 'sendTransaction').as('sendTransactionStub')
          .resolves({});

        mount(
          <SwapWidgetTestComponent
            initialStateOverride={{
              ...testSwapState,
              tokenBalances: [
                {
                  balance: BigNumber.from('1000000000000000000'),
                  formattedBalance: '1',
                  token: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18,
                    address: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
                  },
                },
                {
                  balance: BigNumber.from('1000000000000000000'),
                  formattedBalance: '1',
                  token: {
                    name: 'ImmutableX',
                    symbol: 'IMX',
                    decimals: 18,
                    address: '',
                  },
                },
              ],
            }}
            cryptoConversionsOverride={cryptoConversions}
          >
            <SwapCoins />
          </SwapWidgetTestComponent>,
        );

        cySmartGet('fromTokenInputs-select-form-select__target').click();
        cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff')
          .click();
        cySmartGet('toTokenInputs-select-form-select__target').click();
        cySmartGet('toTokenInputs-select-form-coin-selector__option-imx').click();

        cySmartGet('fromTokenInputs-text-form-text__input').type('0.1').trigger('change');
        cySmartGet('fromTokenInputs-text-form-text__input').blur();

        cySmartGet('swap-button').click();

        cySmartGet('not-enough-gas-bottom-sheet').should('not.exist');
        cySmartGet('transaction-rejected-heading').should('not.exist');
        cySmartGet('swap-button__icon').should('have.attr', 'data-icon', 'Loading');
      });
    });

    describe('dex error', () => {
      it('should show unable to swap if dex returns an error', () => {
        cy.stub(quotesProcessor, 'fromAmountIn')
          .as('fromAmountInStub')
          .rejects({});

        mount(
          <SwapWidgetTestComponent
            initialStateOverride={{
              ...testSwapState,
            }}
            cryptoConversionsOverride={cryptoConversions}
          >
            <SwapCoins />
          </SwapWidgetTestComponent>,
        );

        cySmartGet('fromTokenInputs-select-form-select__target').click();
        cySmartGet('fromTokenInputs-select-form-coin-selector__option-eth-0xf57e7e7c23978c3caec3c3548e3d615c346e79ff')
          .click();
        cySmartGet('toTokenInputs-select-form-select__target').click();
        cySmartGet('toTokenInputs-select-form-coin-selector__option-imx').click();

        cySmartGet('fromTokenInputs-text-form-text__input').type('0.00001').trigger('change');
        cySmartGet('fromTokenInputs-text-form-text__input').blur();

        cySmartGet('unable-to-swap-bottom-sheet').should('be.visible');
        cySmartGet('unable-to-swap-cancel-button').should('be.visible');
        cySmartGet('unable-to-swap-cancel-button').click();
        cySmartGet('unable-to-swap-bottom-sheet').should('not.exist');
      });
    });
  });
});
