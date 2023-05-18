import { mount } from 'cypress/react18';
import { cySmartGet } from '../../../../lib/testUtils';
import { SwapWidgetTestComponent } from '../../test-components/SwapWidgetTestComponent';
import { SwapForm } from './SwapForm';
import { text } from '../../../../resources/text/textConfig';
import { SwapWidgetViews } from '../../../../context/view-context/SwapViewContextTypes';

describe('SwapForm', () => {
  const { from: fromText, to: toText } = text.views[SwapWidgetViews.SWAP].swapForm;

  describe('initial form state', () => {
    it('should show all swap inputs with initial state', () => {
      mount(
        <SwapWidgetTestComponent>
          <SwapForm />
        </SwapWidgetTestComponent>,
      );
      cySmartGet('fromTokenInputs-select__target').should('be.visible');
      cySmartGet('fromTokenInputs-select__target').should('have.text', 'Select coin');
      cySmartGet('fromTokenInputs-text')
        .should('be.visible');
      cySmartGet('fromTokenInputs-text__input')
        .should('have.attr', 'placeholder', fromText.inputPlaceholder);
      cySmartGet('toTokenInputs-select__target').should('be.visible');
      cySmartGet('toTokenInputs-select__target').should('have.text', 'Select coin');
      cySmartGet('toTokenInputs-text').should('be.visible');
      cySmartGet('toTokenInputs-text__input').should('have.attr', 'placeholder', toText.inputPlaceholder);
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
        cySmartGet('fromTokenInputs-text__input').type(testCase.input).trigger('change');
        cySmartGet('fromTokenInputs-text__input').should('have.attr', 'value', testCase.expected);
      });
    });
  });
});
