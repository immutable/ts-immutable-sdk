import { mount } from 'cypress/react18';
import { describe } from 'local-cypress';
import { BiomeCombinedProviders } from '@biom3/react';
import { SelectForm } from './SelectForm';
import { cySmartGet } from '../../../lib/testUtils';

describe('SelectForm', () => {
  it('should show selected option when selected option in option list', () => {
    mount(
      <BiomeCombinedProviders>
        <SelectForm
          id="select-form-test"
          options={[
            {
              id: 'imx',
              name: 'ImmutableX',
              symbol: 'IMX',
            },
            {
              id: 'eth',
              name: 'Ethereum',
              symbol: 'ETH',
            },
          ]}
          onSelectChange={() => {}}
          coinSelectorHeading="Select coin"
          selectedOption="imx"
        />
      </BiomeCombinedProviders>,
    );
    cySmartGet('select-form-test-select__target__controlledLabel').should('have.text', 'IMX');
  });

  it('should show options in options list', () => {
    mount(
      <BiomeCombinedProviders>
        <SelectForm
          id="select-form-test"
          options={[
            {
              id: 'imx',
              name: 'ImmutableX',
              symbol: 'IMX',
            },
            {
              id: 'eth',
              name: 'Ethereum',
              symbol: 'ETH',
            },
          ]}
          onSelectChange={() => {}}
          coinSelectorHeading="Select coin"
        />
      </BiomeCombinedProviders>,
    );
    cySmartGet('select-form-test-select__target').click();
    cySmartGet('select-form-test-coin-selector__option-imx').should('exist');
    cySmartGet('select-form-test-coin-selector__option-eth').should('exist');
  });

  it('should show select coin when no selected option', () => {
    mount(
      <BiomeCombinedProviders>
        <SelectForm
          id="select-form-test"
          options={[
            {
              id: 'imx',
              name: 'ImmutableX',
              symbol: 'IMX',
            },
            {
              id: 'eth',
              name: 'Ethereum',
              symbol: 'ETH',
            },
          ]}
          onSelectChange={() => {}}
          coinSelectorHeading="Select coin"
        />
      </BiomeCombinedProviders>,
    );
    cySmartGet('select-form-test-select__target__defaultLabel').should('have.text', 'Select coin');
  });

  it('should show select coin when options is empty', () => {
    mount(
      <BiomeCombinedProviders>
        <SelectForm
          id="select-form-test"
          options={[]}
          onSelectChange={() => {}}
          coinSelectorHeading="Select coin"
        />
      </BiomeCombinedProviders>,
    );
    cySmartGet('select-form-test-select__target__defaultLabel').should('have.text', 'Select coin');
  });

  it('should show select coin when selected option not in options list', () => {
    mount(
      <BiomeCombinedProviders>
        <SelectForm
          id="select-form-test"
          options={[]}
          onSelectChange={() => {}}
          coinSelectorHeading="Select coin"
          selectedOption="imx"
        />
      </BiomeCombinedProviders>,
    );
    cySmartGet('select-form-test-select__target__defaultLabel').should('have.text', 'Select coin');
  });
});
