import { Select, Option, TextInput, Box } from '@biom3/react';
import {
  inputStyle,
  selectInputBoxStyle,
  selectStyle,
} from './SelectInputStyles';
import { useState } from 'react';
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
  selectValidator: (value: string) => boolean;
  textInputValidator: (value: string) => boolean;
}

export const SelectInput = ({
  options,
  selectValidator,
  textInputValidator,
}: SelectInputProps) => {
  return (
    <Box sx={selectInputBoxStyle}>
      <Box sx={selectStyle}>
        <SelectForm options={options} validator={selectValidator} />
      </Box>
      <Box sx={inputStyle}>
        <TextInputForm validator={textInputValidator} />
      </Box>
    </Box>
  );
};
