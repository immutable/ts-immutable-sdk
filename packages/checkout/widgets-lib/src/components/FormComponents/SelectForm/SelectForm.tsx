import {
  Select, Box, OptionKey,
} from '@biom3/react';
import { useMemo, useState } from 'react';
import { Environment } from '@imtbl/config';
import { WidgetTheme } from '@imtbl/checkout-sdk';
import { TokenImage } from 'components/TokenImage/TokenImage';
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
  environment?: Environment;
  theme?: WidgetTheme,
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
  environment = Environment.PRODUCTION,
  theme = WidgetTheme.DARK,
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

  const filteredOption = options?.find((o) => o.id === selectedOption) as CoinSelectorOptionProps ?? selectedOption;

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
          {filteredOption && (
            <Select.Option
              key={filteredOption.id}
              optionKey={filteredOption.id}
              testId={filteredOption.testId}
              // select cannot currently be disabled so disabling at the option level for now
              disabled={disabled}
            >
              {!filteredOption.icon && (
                <Select.Option.Icon icon="Coins" variant="bold" />
              )}
              {filteredOption.icon && (
                <Select.Option.FramedImage
                  use={(
                    <TokenImage
                      environment={environment}
                      theme={theme}
                      token={filteredOption.id}
                      name={filteredOption.name}
                    />
                  )}
                  circularFrame
                  sx={{ background: 'base.color.translucent.standard.100' }}
                />
              )}
              <Select.Option.Label>{filteredOption.symbol}</Select.Option.Label>
            </Select.Option>
          )}
        </Select>
      </FormControlWrapper>
    </Box>
  );
}
