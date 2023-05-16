import { Select, Option, Box, Body } from '@biom3/react';
// import { FormControlWrapper } from '../FormControlWrapper/FormControlWrapper';

type IconList = 'EthToken' | 'ImxTokenDex';

export interface SelectOption {
  id: string;
  label: string;
  icon?: IconList;
  boldVariant?: boolean;
}

interface SelectFormProps {
  options: SelectOption[];
  textAlign?: 'left' | 'right';
  subtext?: string;
  isErrored?: boolean;
  errorMessage?: string;
}

export const SelectForm = ({ options, subtext }: SelectFormProps) => {
  return (
    // todo: biome does not currently support Select for FormControl
    // <FormControlWrapper textAlign={textAlign ?? 'left'}>
    <Box>
      <Select size="large" defaultLabel="Select coin">
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
      <Body
        size="xSmall"
        sx={{
          display: subtext ? '' : 'none',
          color: 'base.color.text.secondary',
        }}
      >
        {subtext}
      </Body>
    </Box>
    // </FormControlWrapper>
  );
};
