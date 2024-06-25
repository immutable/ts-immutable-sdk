import { mount } from 'cypress/react18';
import { describe } from 'local-cypress';
import { ViewContextTestComponent } from '../../../context/view-context/test-components/ViewContextTestComponent';
import { cySmartGet } from '../../../lib/testUtils';
import { TextInputForm } from './TextInputForm';

describe('TextInputForm', () => {
  describe('type number', () => {
    it('should convert . into zero number when type is number input', () => {
      mount(
        <ViewContextTestComponent>
          <TextInputForm
            type="number"
            testId="text-input-form-test"
            value=""
            validator={() => true}
            onTextInputChange={() => {}}
          />
        </ViewContextTestComponent>,
      );
      cySmartGet('text-input-form-test-select__input').type('.');
      cySmartGet('text-input-form-test-select__input').trigger('change');
      cySmartGet('text-input-form-test-select__target__controlledLabel').should('have.text', '0.');
    });
  });

  describe('type text or no type', () => {
    it('should preserve . as .', () => {
      mount(
        <ViewContextTestComponent>
          <TextInputForm
            testId="text-input-form-test"
            value=""
            validator={() => true}
            onTextInputChange={() => {}}
          />
        </ViewContextTestComponent>,
      );
      cySmartGet('text-input-form-test-select__input').type('.');
      cySmartGet('text-input-form-test-select__input').trigger('change');
      cySmartGet('text-input-form-test-select__target__controlledLabel').should('have.text', '.');
    });
  });
});
