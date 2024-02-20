import { Box, OptionKey } from '@biom3/react';
import {
  inputStyle,
  selectInputBoxStyle,
  selectStyle,
} from './SelectInputStyles';
import { SelectForm } from '../SelectForm/SelectForm';
import { TextInputForm, TextInputType } from '../TextInputForm/TextInputForm';
import { CoinSelectorOptionProps } from '../../CoinSelector/CoinSelectorOption';

interface SelectInputProps {
  testId: string;
  options: CoinSelectorOptionProps[];
  selectTextAlign?: 'left' | 'right';
  textInputTextAlign?: 'left' | 'right';
  textInputValue: string;
  textInputPlaceholder?: string;
  textInputSubtext?: string;
  textInputErrorMessage?: string;
  textInputType?: TextInputType;
  selectSubtext?: string;
  selectErrorMessage?: string;
  coinSelectorHeading: string;
  textInputDisabled?: boolean;
  selectInputDisabled?: boolean;
  textInputValidator: (value: string) => boolean;
  onTextInputChange: (value: string) => void;
  onTextInputBlur?: (value: string) => void;
  onTextInputFocus?: (value: string) => void;
  textInputMaxButtonClick?: () => void;
  onSelectChange: (value: OptionKey) => void;
  selectedOption?: OptionKey;
  defaultTokenImage: string;
}

export function SelectInput({
  testId,
  options,
  textInputValue,
  textInputPlaceholder,
  textInputValidator,
  textInputType,
  onTextInputChange,
  onTextInputBlur,
  onTextInputFocus,
  textInputTextAlign,
  textInputSubtext,
  textInputErrorMessage,
  selectTextAlign,
  selectSubtext,
  selectErrorMessage,
  textInputMaxButtonClick,
  onSelectChange,
  textInputDisabled,
  selectInputDisabled,
  selectedOption,
  coinSelectorHeading,
  defaultTokenImage,
}: SelectInputProps) {
  return (
    <Box sx={selectInputBoxStyle}>
      <Box sx={selectStyle}>
        <SelectForm
          testId={`${testId}-select-form`}
          options={options}
          subtext={selectSubtext}
          textAlign={selectTextAlign}
          errorMessage={selectErrorMessage}
          onSelectChange={onSelectChange}
          disabled={selectInputDisabled}
          selectedOption={selectedOption}
          coinSelectorHeading={coinSelectorHeading}
          defaultTokenImage={defaultTokenImage}
        />
      </Box>
      <Box sx={inputStyle}>
        <TextInputForm
          type={textInputType}
          testId={`${testId}-text-form`}
          value={textInputValue}
          placeholder={textInputPlaceholder}
          subtext={textInputSubtext}
          textAlign={textInputTextAlign}
          errorMessage={textInputErrorMessage}
          validator={textInputValidator}
          onTextInputChange={onTextInputChange}
          onTextInputBlur={onTextInputBlur}
          onTextInputFocus={onTextInputFocus}
          maxButtonClick={textInputMaxButtonClick}
          disabled={textInputDisabled}
        />
      </Box>
    </Box>
  );
}
