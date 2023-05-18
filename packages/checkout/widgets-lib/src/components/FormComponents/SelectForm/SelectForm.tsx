/* eslint-disable react/no-unused-prop-types */
import {
  Select, Option, Box, Body, OptionKey,
} from '@biom3/react';
// import { FormControlWrapper } from '../FormControlWrapper/FormControlWrapper';

type IconList = 'EthToken' | 'ImxTokenDex';

export interface SelectOption {
  id: string;
  label: string;
  icon?: IconList;
}

interface SelectFormProps {
  id: string;
  options: SelectOption[];
  textAlign?: 'left' | 'right';
  subtext?: string;
  isErrored?: boolean;
  errorMessage?: string;
  onSelectChange?: (value: OptionKey) => void;
}

export function SelectForm({
  id,
  options,
  subtext,
  onSelectChange,
}: SelectFormProps) {
  return (
    // todo: biome does not currently support Select for FormControl
    // <FormControlWrapper textAlign={textAlign ?? 'left'}>
    <Box>
      <Select
        id={`${id}-select`}
        testId={`${id}-select`}
        size="large"
        defaultLabel="Select coin"
        onSelectChange={onSelectChange}
      >
        {options.map((option) => (
          <Option
            key={option.id}
            optionKey={option.id}
            testId={`${id}-${option.id}`}
          >
            {!option.icon && (
              <Option.Icon icon={option.icon ?? 'Coins'} variant="bold" />
            )}
            {option.icon && (
              <Option.FramedImage imageUrl={option.icon} circularFrame />
            )}
            <Option.Label>{option.label}</Option.Label>
          </Option>
        ))}
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
}
