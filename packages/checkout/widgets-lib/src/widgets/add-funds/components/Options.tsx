import { Box, MenuItemSize } from '@biom3/react';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import {
  listItemVariants,
  listVariants,
} from '../../../lib/animation/listAnimation';
import { CardOption, CardOptionTypes } from './CardOption';

const defaultOptions: CardOptionTypes[] = [
  CardOptionTypes.DEBIT,
  CardOptionTypes.CREDIT,
];

export interface OptionsProps {
  onClick: (type: CardOptionTypes) => void;
  disabledOptions?: CardOptionTypes[];
  options?: CardOptionTypes[];
  captions?: Partial<Record<CardOptionTypes, string>>;
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
        <CardOption
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
