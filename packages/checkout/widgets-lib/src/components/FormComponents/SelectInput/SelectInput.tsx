import { Select, Option, TextInput, Box } from '@biom3/react';
import {
  inputStyle,
  selectInputBoxStyle,
  selectStyle,
} from './SelectInputStyles';
import { useState } from 'react';

// todo: sort out this list
type IconList = 'EthToken' | 'ImxTokenDex';

interface SelectInputProps {
  options: {
    id: string;
    label: string;
    icon?: IconList;
    boldVariant?: boolean;
  }[];
}

export const SelectInput = ({ options }: SelectInputProps) => {
  const [textInputValue, setTextInputValue] = useState<string>('');

  const handleOnChange = () => {
    console.log('handleOnChange');
  };

  return (
    <Box sx={selectInputBoxStyle}>
      <Box sx={selectStyle}>
        <Select size="large">
          {options.map((option) => {
            return (
              <Option key={option.id} optionKey={option.id}>
                <Option.Icon
                  icon={option.icon ?? 'Coins'}
                  variant={option.boldVariant ? 'bold' : 'regular'}
                />
                <Option.Label>{option.label}</Option.Label>
              </Option>
            );
          })}
        </Select>
      </Box>

      <Box sx={inputStyle}>
        <TextInput
          onChange={() => handleOnChange()}
          sizeVariant="large"
          // value={textInputValue}
          validationStatus="error"
          placeholder="1.123456"
        >
          <TextInput.Button
            onClick={() => console.log('max btn clicked, do stuff!')}
          >
            max
          </TextInput.Button>
          <TextInput.Icon icon="Calendar" />
        </TextInput>
      </Box>
    </Box>
  );
};
