import {
  Select, Option, Box, OptionKey,
} from '@biom3/react';
import { useMemo, useState } from 'react';
import { FormControlWrapper } from '../FormControlWrapper/FormControlWrapper';
import { CoinSelector } from '../../CoinSelector/CoinSelector';
import { CoinSelectorOptionProps } from '../../CoinSelector/CoinSelectorOption';

interface SelectFormProps {
  testId: string;
  options: CoinSelectorOptionProps[];
  optionsLoading?: boolean;
  textAlign?: 'left' | 'right';
  subtext?: string;
  errorMessage?: string;
  selectedOption?: OptionKey;
  disabled?: boolean;
  onSelectChange: (value: string) => void;
  coinSelectorHeading: string;
  defaultTokenImage: string;
}

export function SelectForm({
  testId,
  options,
  optionsLoading,
  subtext,
  onSelectChange,
  textAlign,
  errorMessage,
  disabled,
  selectedOption,
  coinSelectorHeading,
  defaultTokenImage,
}: SelectFormProps) {
  const [coinSelectorOpen, setCoinSelectorOpen] = useState<boolean>(false);

  const coinSelectorOptions = useMemo(() => options.map((option) => ({
    ...option,
    testId,
    onClick: () => {
      onSelectChange(option.id);
      setCoinSelectorOpen(false);
    },
  })), [options, onSelectChange, setCoinSelectorOpen]);

  const getSelectedOption = () => {
    if (!selectedOption) return undefined;
    if (options.length === 0) return undefined;
    if (!options.find((o) => o.id === selectedOption)) return undefined;
    return selectedOption;
  };

  return (
    <Box>
      <CoinSelector
        heading={coinSelectorHeading}
        options={coinSelectorOptions}
        defaultTokenImage={defaultTokenImage}
        optionsLoading={optionsLoading ?? false}
        visible={coinSelectorOpen}
        onCloseDrawer={() => setCoinSelectorOpen(false)}
      />
      <FormControlWrapper
        testId={`${testId}-select-control`}
        textAlign={textAlign ?? 'left'}
        subtext={errorMessage ? undefined : subtext}
        isErrored={!!errorMessage}
        errorMessage={errorMessage}
      >
        <Select
          testId={`${testId}-select`}
          size="large"
          defaultLabel="Select coin"
          targetClickOveride={() => setCoinSelectorOpen(true)}
          selectedOption={getSelectedOption()}
          sx={{ minw: '170px' }}
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
              testId={option.testId}
              // select cannot currently be disabled so disabling at the option level for now
              disabled={disabled}
            >
              {!option.icon && (
                <Option.Icon icon="Coins" variant="bold" />
              )}
              {option.icon && (
                <Option.FramedImage
                  imageUrl={option.icon}
                  circularFrame
                  defaultImageUrl={defaultTokenImage}
                  sx={{ background: 'base.color.translucent.standard.100' }}
                />
              )}
              <Option.Label>{option.symbol}</Option.Label>
            </Option>
          ))}
        </Select>
      </FormControlWrapper>
    </Box>
  );
}
