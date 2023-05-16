import { Box } from '@biom3/react';
import {
  inputStyle,
  selectInputBoxStyle,
  selectStyle,
} from './SelectInputStyles';
import { SelectForm, SelectOption } from '../SelectForm/SelectForm';
import { TextInputForm } from '../TextInputForm/TextInputForm';

// todo: sort out this list
type IconList = 'EthToken' | 'ImxTokenDex';

interface SelectInputProps {
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
}

export const SelectInput = ({
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
}: SelectInputProps) => {
  return (
    <Box sx={selectInputBoxStyle}>
      <Box sx={selectStyle}>
        <SelectForm
          options={options}
          subtext={selectSubtext}
          textAlign={selectTextAlign}
          isErrored={selectErrored}
          errorMessage={selectErrorMessage}
        />
      </Box>
      <Box sx={inputStyle}>
        <TextInputForm
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
};
