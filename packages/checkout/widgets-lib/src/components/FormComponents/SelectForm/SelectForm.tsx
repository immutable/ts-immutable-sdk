import { Select, Option } from '@biom3/react';
// import { FormControlWrapper } from '../FormControlWrapper/FormControlWrapper';

type IconList = 'EthToken' | 'ImxTokenDex';

interface SelectFormProps {
  options: {
    id: string;
    label: string;
    icon?: IconList;
    boldVariant?: boolean;
  }[];
  textAlign?: 'left' | 'right';
  subtext?: string;
  isErrored?: boolean;
  errorMessage?: string;
}

export const SelectForm = ({ options }: SelectFormProps) => {
  return (
    // todo: biome does not currently support Select for FormControl
    // <FormControlWrapper textAlign={textAlign ?? 'left'}>
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
    // </FormControlWrapper>
  );
};
