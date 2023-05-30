/* eslint-disable react/no-unused-prop-types */
import {
  Select, Option, Box, OptionKey,
} from '@biom3/react';
import { useState } from 'react';
import { FormControlWrapper } from '../FormControlWrapper/FormControlWrapper';
import { CoinSelector } from '../../CoinSelector/CoinSelector';

type IconList = 'EthToken' | 'ImxTokenDex';

export interface SelectOption {
  id: string;
  name: string;
  icon?: IconList;
  symbol: string;
}

interface SelectFormProps {
  id: string;
  options: SelectOption[];
  textAlign?: 'left' | 'right';
  subtext?: string;
  errorMessage?: string;
  selectedOption?: OptionKey;
  disabled?: boolean;
  onSelectChange: (value: string) => void;
  coinSelectorHeading: string;
}

export function SelectForm({
  id,
  options,
  subtext,
  onSelectChange,
  textAlign,
  errorMessage,
  disabled,
  selectedOption,
  coinSelectorHeading,
}: SelectFormProps) {
  const [coinSelectorOpen, setCoinSelectorOpen] = useState<boolean>(false);

  return (
    <Box>
      <CoinSelector
        testId={id}
        heading={coinSelectorHeading}
        options={
          options.map((option) => ({
            ...option,
            icon: option.icon || 'Coins',
            framedImageUrl: option.icon,
            onClick: () => {
              onSelectChange(option.id);
              setCoinSelectorOpen(false);
            },
          }))
        }
        visible={coinSelectorOpen}
        onCloseBottomSheet={() => setCoinSelectorOpen(false)}
      />
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
          targetClickOveride={() => { setCoinSelectorOpen(true); }}
          selectedOption={selectedOption || undefined}
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
                <Option.Icon icon="Coins" variant="bold" />
              )}
              {option.icon && (
                <Option.FramedImage imageUrl={option.icon} circularFrame />
              )}
              <Option.Label>{option.symbol}</Option.Label>
            </Option>
          ))}
        </Select>
      </FormControlWrapper>
    </Box>
  );
}
