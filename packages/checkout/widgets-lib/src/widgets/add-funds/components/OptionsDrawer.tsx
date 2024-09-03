import { Box, Drawer } from '@biom3/react';
import { motion } from 'framer-motion';
import { listVariants } from '../../../lib/animation/listAnimation';
import { Options } from './Options';
import { OptionTypes } from './Option';

type OptionsDrawerProps = {
  showOnrampOption?: boolean;
  showSwapOption?: boolean;
  showBridgeOption?: boolean;
  visible: boolean;
  onClose: () => void;
  onPayWithCard?: (paymentType: OptionTypes) => void;
};

export function OptionsDrawer({
  showOnrampOption,
  showSwapOption,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showBridgeOption,
  visible,
  onClose,
  onPayWithCard,
}: OptionsDrawerProps) {
  const disabledOptions: OptionTypes[] = [];
  if (!showOnrampOption) {
    disabledOptions.push(OptionTypes.CREDIT);
    disabledOptions.push(OptionTypes.DEBIT);
  }
  if (!showSwapOption) {
    disabledOptions.push(OptionTypes.SWAP);
  }

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
            onClick={onPayWithCard ?? (() => {
            })}
            size="medium"
            hideDisabledOptions
            options={[
              OptionTypes.SWAP,
              OptionTypes.DEBIT,
              OptionTypes.CREDIT,
            ]}
            disabledOptions={disabledOptions}
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
