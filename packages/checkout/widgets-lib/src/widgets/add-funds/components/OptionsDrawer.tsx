import { Box, Drawer } from '@biom3/react';
import { motion } from 'framer-motion';
import { listVariants } from '../../../lib/animation/listAnimation';
import { Options } from './Options';
import { CardOptionTypes } from './CardOption';

type OptionsDrawerProps = {
  showOnrampOption?: boolean;
  showSwapOption?: boolean;
  showBridgeOption?: boolean;
  visible: boolean;
  onClose: () => void;
  onPayWithCard?: (paymentType: CardOptionTypes) => void;
};

export function OptionsDrawer({
  showOnrampOption,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showSwapOption,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showBridgeOption,
  visible,
  onClose,
  onPayWithCard,
}: OptionsDrawerProps) {
  const disabledOptions: CardOptionTypes[] = [];
  if (!showOnrampOption) {
    disabledOptions.push(CardOptionTypes.CREDIT);
    disabledOptions.push(CardOptionTypes.DEBIT);
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
              CardOptionTypes.DEBIT,
              CardOptionTypes.CREDIT,
            ]}
            disabledOptions={disabledOptions}
            captions={{
              [CardOptionTypes.DEBIT]: 'Debit',
              [CardOptionTypes.CREDIT]: 'Credit',
            }}
          />
        </Box>
      </Drawer.Content>
    </Drawer>
  );
}
