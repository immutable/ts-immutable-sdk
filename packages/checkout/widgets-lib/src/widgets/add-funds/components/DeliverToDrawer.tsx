import { Body, Drawer } from '@biom3/react';
import { motion } from 'framer-motion';
import { listVariants } from '../../../lib/animation/listAnimation';

type DeliverToDrawerProps = {
  visible: boolean;
  onClose: () => void;
};

export function DeliverToDrawer({ visible, onClose }: DeliverToDrawerProps) {
  return (
    <Drawer
      size="full"
      visible={visible}
      showHeaderBar
      onCloseDrawer={onClose}
      headerBarTitle="Deliver to"
    >
      <Drawer.Content
        rc={
          <motion.div variants={listVariants} initial="hidden" animate="show" />
        }
      >
        <Body>@TODO Set to provider</Body>
      </Drawer.Content>
    </Drawer>
  );
}
