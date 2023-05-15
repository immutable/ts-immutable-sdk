import { Box } from '@biom3/react';
import {
  inputStyle,
  selectInputBoxStyle,
  selectStyle,
} from './SelectInputStyles';
import { SelectForm } from '../SelectForm/SelectForm';
import { TextInputForm } from '../TextInputForm/TextInputForm';

// todo: sort out this list
type IconList = 'EthToken' | 'ImxTokenDex';

interface SelectInputProps {
  options: {
    id: string;
    label: string;
    icon?: IconList;
    boldVariant?: boolean;
  }[];
  selectTextAlign?: 'left' | 'right';
  textInputTextAlign?: 'left' | 'right';
  textInputSubtext?: string;
  textInputErrored?: boolean;
  textInputErrorMessage?: string;
  selectSubtext?: string;
  selectErrored?: boolean;
  selectErrorMessage?: string;
  textInputValidator: (value: string) => boolean;
  onTextInputBlur: (value: string) => void;
  textInputMaxButtonClick?: () => void;
}

export const SelectInput = ({
  options,
  textInputValidator,
  onTextInputBlur,
  textInputTextAlign,
  selectTextAlign,
  textInputSubtext,
  textInputErrored,
  textInputErrorMessage,
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
          subtext={textInputSubtext}
          textAlign={textInputTextAlign}
          isErrored={textInputErrored}
          errorMessage={textInputErrorMessage}
          validator={textInputValidator}
          onTextInputBlur={onTextInputBlur}
          maxButtonClick={textInputMaxButtonClick}
        />
      </Box>
    </Box>
  );
};
