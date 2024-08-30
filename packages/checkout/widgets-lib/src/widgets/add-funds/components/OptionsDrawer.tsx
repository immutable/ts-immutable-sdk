import { Box, Drawer } from '@biom3/react';
import { motion } from 'framer-motion';
import { listVariants } from '../../../lib/animation/listAnimation';
import { Options } from './Options';
import { OptionTypes } from './Option';

type OptionsDrawerProps = {
  visible: boolean;
  onClose: () => void;
  onPayWithCard?: (paymentType: OptionTypes) => void;
};

export function OptionsDrawer({
  visible,
  onClose,
  onPayWithCard,
}: OptionsDrawerProps) {
  return (
    <Drawer
      size="full"
      visible={visible}
      showHeaderBar
      onCloseDrawer={onClose}
      headerBarTitle="Pay with..."
    >
      <Drawer.Content
        rc={
          <motion.div variants={listVariants} initial="hidden" animate="show" />
        }
      >
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            px: 'base.spacing.x4',
          }}
        >
          <Options
            onClick={onPayWithCard ?? (() => {})}
            size="medium"
            hideDisabledOptions
            options={[
              OptionTypes.SWAP,
              OptionTypes.DEBIT,
              OptionTypes.CREDIT,
            ]}
            disabledOptions={[]}
            captions={{
              [OptionTypes.SWAP]: 'Swap',
              [OptionTypes.DEBIT]: 'Debit',
              [OptionTypes.CREDIT]: 'Credit',
            }}
          />
        </Box>
      </Drawer.Content>
    </Drawer>
  );
}
