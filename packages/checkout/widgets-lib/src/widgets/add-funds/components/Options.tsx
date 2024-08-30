import { Box, MenuItemSize } from '@biom3/react';

import { motion } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import {
  listItemVariants,
  listVariants,
} from '../../../lib/animation/listAnimation';
import { Option, OptionTypes } from './Option';

const defaultOptions: OptionTypes[] = [
  OptionTypes.SWAP,
  OptionTypes.DEBIT,
  OptionTypes.CREDIT,
];

export interface OptionsProps {
  onClick: (type: OptionTypes) => void;
  disabledOptions?: OptionTypes[];
  options?: OptionTypes[];
  captions?: Partial<Record<OptionTypes, string>>;
  size?: MenuItemSize;
  hideDisabledOptions?: boolean;
}

export function Options(props: OptionsProps) {
  const {
    disabledOptions = [],
    options,
    onClick,
    captions,
    size,
    hideDisabledOptions,
  } = props;
  const filteredOptions = useMemo(
    () => (options || defaultOptions).filter(
      (option) => !hideDisabledOptions || !disabledOptions.includes(option),
    ),
    [options, disabledOptions, hideDisabledOptions],
  );

  useEffect(() => {
    if (filteredOptions.length === 1) {
      onClick(filteredOptions[0]);
    }
  }, [options, onClick]);

  return (
    <Box
      testId="options-list"
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
      rc={
        <motion.div variants={listVariants} initial="hidden" animate="show" />
      }
    >
      {filteredOptions.map((type, idx: number) => (
        <Option
          key={`option-type-${type}`}
          type={type}
          size={size}
          onClick={onClick}
          disabled={disabledOptions.includes(type)}
          caption={captions?.[type]}
          rc={<motion.div custom={idx} variants={listItemVariants} />}
        />
      ))}
    </Box>
  );
}
