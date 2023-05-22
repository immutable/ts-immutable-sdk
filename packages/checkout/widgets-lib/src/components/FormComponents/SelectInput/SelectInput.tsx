import { Box, OptionKey } from '@biom3/react';
import {
  inputStyle,
  selectInputBoxStyle,
  selectStyle,
} from './SelectInputStyles';
import { SelectForm, SelectOption } from '../SelectForm/SelectForm';
import { TextInputForm } from '../TextInputForm/TextInputForm';

interface SelectInputProps {
  id: string;
  options: SelectOption[];
  selectTextAlign?: 'left' | 'right';
  textInputTextAlign?: 'left' | 'right';
  textInputValue: string;
  textInputPlaceholder?: string;
  textInputSubtext?: string;
  textInputErrorMessage?: string;
  selectSubtext?: string;
  selectErrorMessage?: string;
  textInputDisabled?: boolean;
  selectInputDisabled?: boolean;
  textInputValidator: (value: string) => boolean;
  onTextInputChange: (value: string) => void;
  onTextInputBlur: (value: string) => void;
  onTextInputFocus?: (value: string) => void;
  textInputMaxButtonClick?: () => void;
  onSelectChange: (value: OptionKey) => void;
}

export function SelectInput({
  id,
  options,
  textInputValue,
  textInputPlaceholder,
  textInputValidator,
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
}: SelectInputProps) {
  return (
    <Box sx={selectInputBoxStyle}>
      <Box sx={selectStyle}>
        <SelectForm
          id={`${id}-select-form`}
          options={options}
          subtext={selectSubtext}
          textAlign={selectTextAlign}
          errorMessage={selectErrorMessage}
          onSelectChange={onSelectChange}
          disabled={selectInputDisabled}
        />
      </Box>
      <Box sx={inputStyle}>
        <TextInputForm
          id={`${id}-text-form`}
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
