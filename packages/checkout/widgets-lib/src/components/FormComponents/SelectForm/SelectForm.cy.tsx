import { mount } from 'cypress/react18';
import { describe } from 'local-cypress';
import { ViewContextTestComponent } from '../../../context/view-context/test-components/ViewContextTestComponent';
import { SelectForm } from './SelectForm';
import { cySmartGet } from '../../../lib/testUtils';

describe('SelectForm', () => {
  it('should show selected option when selected option in option list', () => {
    mount(
      <ViewContextTestComponent>
        <SelectForm
          testId="select-form-test"
          options={[
            {
              id: 'imx',
              name: 'ImmutableX',
              symbol: 'IMX',
              defaultTokenImage: 'default-token-image',
            },
            {
              id: 'eth',
              name: 'Ethereum',
              symbol: 'ETH',
              defaultTokenImage: 'default-token-image',
            },
          ]}
          onSelectChange={() => {}}
          coinSelectorHeading="Select coin"
          selectedOption="imx"
          defaultTokenImage="default-token-image"
        />
      </ViewContextTestComponent>,
    );
    cySmartGet('select-form-test-select__target__label').should('have.text', 'IMX');
  });

  it('should show options in options list', () => {
    mount(
      <ViewContextTestComponent>
        <SelectForm
          testId="select-form-test"
          options={[
            {
              id: 'imx',
              name: 'ImmutableX',
              symbol: 'IMX',
              defaultTokenImage: 'default-token-image',
            },
            {
              id: 'eth',
              name: 'Ethereum',
              symbol: 'ETH',
              defaultTokenImage: 'default-token-image',
            },
          ]}
          onSelectChange={() => {}}
          coinSelectorHeading="Select coin"
          defaultTokenImage="default-token-image"
        />
      </ViewContextTestComponent>,
    );
    cySmartGet('select-form-test-select__target').click();
    cySmartGet('select-form-test-coin-selector__option-imx').should('exist');
    cySmartGet('select-form-test-coin-selector__option-eth').should('exist');
  });

  it('should show select coin when no selected option', () => {
    mount(
      <ViewContextTestComponent>
        <SelectForm
          testId="select-form-test"
          options={[
            {
              id: 'imx',
              name: 'ImmutableX',
              symbol: 'IMX',
              defaultTokenImage: 'default-token-image',
            },
            {
              id: 'eth',
              name: 'Ethereum',
              symbol: 'ETH',
              defaultTokenImage: 'default-token-image',
            },
          ]}
          onSelectChange={() => {}}
          coinSelectorHeading="Select coin"
          defaultTokenImage="default-token-image"
        />
      </ViewContextTestComponent>,
    );
    cySmartGet('select-form-test-select__target__label').should('have.text', 'Select coin');
  });

  it('should show select coin when options is empty', () => {
    mount(
      <ViewContextTestComponent>
        <SelectForm
          testId="select-form-test"
          options={[]}
          onSelectChange={() => {}}
          coinSelectorHeading="Select coin"
          defaultTokenImage="default-token-image"
        />
      </ViewContextTestComponent>,
    );
    cySmartGet('select-form-test-select__target__label').should('have.text', 'Select coin');
  });

  it('should show select coin when selected option not in options list', () => {
    mount(
      <ViewContextTestComponent>
        <SelectForm
          testId="select-form-test"
          options={[]}
          onSelectChange={() => {}}
          coinSelectorHeading="Select coin"
          selectedOption="imx"
          defaultTokenImage="default-token-image"
        />
      </ViewContextTestComponent>,
    );
    cySmartGet('select-form-test-select__target__label').should('have.text', 'Select coin');
  });
});
