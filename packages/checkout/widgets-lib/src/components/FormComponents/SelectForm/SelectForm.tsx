/* eslint-disable react/no-unused-prop-types */
import {
  Select, Option, OptionKey,
} from '@biom3/react';
import { FormControlWrapper } from '../FormControlWrapper/FormControlWrapper';
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
  errorMessage?: string;
  onSelectChange?: (value: OptionKey) => void;
}

export function SelectForm({
  id,
  options,
  subtext,
  onSelectChange,
  textAlign,
  errorMessage,
}: SelectFormProps) {
  return (
    <FormControlWrapper
      textAlign={textAlign ?? 'left'}
      subtext={errorMessage ? undefined : subtext}
      isErrored={!!errorMessage}
      errorMessage={errorMessage}
    >
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
    </FormControlWrapper>
  );
}
