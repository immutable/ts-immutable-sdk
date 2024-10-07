import { Body, Drawer } from '@biom3/react';
import { motion } from 'framer-motion';
import { listVariants } from '../../../lib/animation/listAnimation';

type PayWithDrawerProps = {
  visible: boolean;
  onClose: () => void;
};

export function PayWithDrawer({ visible, onClose }: PayWithDrawerProps) {
  return (
    <Drawer
      size="full"
      visible={visible}
      showHeaderBar
      onCloseDrawer={onClose}
      headerBarTitle="Pay with"
    >
      <Drawer.Content
        rc={
          <motion.div variants={listVariants} initial="hidden" animate="show" />
        }
      >
        <Body>@TODO Set from provider</Body>
      </Drawer.Content>
    </Drawer>
  );
}
