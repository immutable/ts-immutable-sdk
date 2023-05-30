/* eslint-disable react/no-unused-prop-types */
import {
  Select, Option, Box, OptionKey,
} from '@biom3/react';
import { useMemo, useState } from 'react';
import { FormControlWrapper } from '../FormControlWrapper/FormControlWrapper';
import { CoinSelector } from '../../CoinSelector/CoinSelector';
import { CoinSelectorOptionProps } from '../../CoinSelector/CoinSelectorOption';

interface SelectFormProps {
  id: string;
  options: CoinSelectorOptionProps[];
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

  const coinSelectorOptions = useMemo(() => options.map((option) => ({
    ...option,
    onClick: () => {
      onSelectChange(option.id);
      setCoinSelectorOpen(false);
    },
  })), [options]);

  return (
    <Box>
      <CoinSelector
        testId={id}
        heading={coinSelectorHeading}
        options={coinSelectorOptions}
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
          targetClickOveride={() => setCoinSelectorOpen(true)}
          selectedOption={selectedOption || undefined}
        >
          {/*
            because we are using the CoinSelector, the options are shown on the bottom sheet component
            and so we are here rendering only the selected option.
            If we will move away from the CoinSelector we will need to simply remove
            `.filter((o) => o.id === selectedOption)?`
            -----
            The reason why we have the options here is only for a visual representation of the selected
            option.
          */}
          {options.filter((o) => o.id === selectedOption)?.map((option) => (
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
