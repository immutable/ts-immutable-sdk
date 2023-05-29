/* eslint-disable react/no-unused-prop-types */
import {
  Select, Option, OptionKey,
} from '@biom3/react';
import { FormControlWrapper } from '../FormControlWrapper/FormControlWrapper';

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
  disabled?: boolean;
  onSelectChange?: (value: OptionKey) => void;
  selectedOption?: OptionKey;
}

export function SelectForm({
  id,
  options,
  subtext,
  onSelectChange,
  textAlign,
  errorMessage,
  selectedOption,
  disabled,
}: SelectFormProps) {
  return (
    <FormControlWrapper
      testId={`${id}-select-control`}
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
        selectedOption={selectedOption}
      >
        {options.map((option) => (
          <Option
            key={option.id}
            optionKey={option.id}
            testId={`${id}-${option.id}`}
            // select cannot currently be disabled so disabling at the option level for now
            disabled={disabled}
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
