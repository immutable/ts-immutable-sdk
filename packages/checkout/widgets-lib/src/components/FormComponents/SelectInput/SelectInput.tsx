import { Box, OptionKey } from '@biom3/react';
import {
  inputStyle,
  selectInputBoxStyle,
  selectStyle,
} from './SelectInputStyles';
import { SelectForm, SelectOption } from '../SelectForm/SelectForm';
import { TextInputForm } from '../TextInputForm/TextInputForm';

interface SelectInputProps {
  testId: string;
  options: SelectOption[];
  selectTextAlign?: 'left' | 'right';
  textInputTextAlign?: 'left' | 'right';
  textInputValue: string;
  textInputPlaceholder?: string;
  textInputSubtext?: string;
  textInputErrored?: boolean;
  textInputErrorMessage?: string;
  selectSubtext?: string;
  selectErrored?: boolean;
  selectErrorMessage?: string;
  textInputValidator: (value: string) => boolean;
  onTextInputFocus: () => void;
  onTextInputChange: (value: string) => void;
  onTextInputBlur: (value: string) => void;
  textInputMaxButtonClick?: () => void;
  onSelectChange: (value: OptionKey) => void;
}

export function SelectInput({
  testId,
  options,
  textInputValue,
  textInputPlaceholder,
  textInputValidator,
  onTextInputFocus,
  onTextInputChange,
  onTextInputBlur,
  textInputTextAlign,
  textInputSubtext,
  textInputErrored,
  textInputErrorMessage,
  selectTextAlign,
  selectSubtext,
  selectErrored,
  selectErrorMessage,
  textInputMaxButtonClick,
  onSelectChange,
}: SelectInputProps) {
  return (
    <Box sx={selectInputBoxStyle}>
      <Box sx={selectStyle}>
        <SelectForm
          testId={`${testId}-select`}
          options={options}
          subtext={selectSubtext}
          textAlign={selectTextAlign}
          isErrored={selectErrored}
          errorMessage={selectErrorMessage}
          onSelectChange={onSelectChange}
        />
      </Box>
      <Box sx={inputStyle}>
        <TextInputForm
          testId={`${testId}-text`}
          value={textInputValue}
          placeholder={textInputPlaceholder}
          subtext={textInputSubtext}
          textAlign={textInputTextAlign}
          isErrored={textInputErrored}
          errorMessage={textInputErrorMessage}
          validator={textInputValidator}
          onTextInputFocus={onTextInputFocus}
          onTextInputChange={onTextInputChange}
          onTextInputBlur={onTextInputBlur}
          maxButtonClick={textInputMaxButtonClick}
        />
      </Box>
    </Box>
  );
}
