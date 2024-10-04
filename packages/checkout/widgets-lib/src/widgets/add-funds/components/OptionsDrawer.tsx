import { Box, Drawer, DUMMY_RASTER_IMAGE_3_URL, EllipsizedText, MenuItem, Stack } from '@biom3/react';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import { listVariants } from '../../../lib/animation/listAnimation';
import { Options } from './Options';
import { FiatOptionType, RouteData } from '../types';
import { AddFundsContext } from '../context/AddFundsContext';

type OptionsDrawerProps = {
  routes: RouteData[] | undefined;
  visible: boolean;
  onClose: () => void;
  onRouteClick: (route: RouteData) => void;
  onCardClick: (type: FiatOptionType) => void;
  showOnrampOption?: boolean;
  showSwapOption?: boolean;
  showBridgeOption?: boolean;
};

export function OptionsDrawer({
  routes,
  visible,
  onClose,
  onRouteClick,
  onCardClick,
  showOnrampOption,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showSwapOption,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showBridgeOption,
}: OptionsDrawerProps) {
  const {
    addFundsState: { chains, balances },
  } = useContext(AddFundsContext);

  return (
    <Drawer
      size="full"
      visible={visible}
      showHeaderBar={false}
      onCloseDrawer={onClose}
    >
      <Drawer.Content
        rc={
          <motion.div variants={listVariants} initial="hidden" animate="show" />
        }
        sx={{
          pt: 'base.spacing.x3',
          px: 'base.spacing.x3',
        }}
      >
        <MenuItem size="xSmall">
          <MenuItem.FramedImage
            // @TODO: we need this to be the actual wallet icon
            use={<img src={DUMMY_RASTER_IMAGE_3_URL} />}
            padded
            emphasized
          />
          <MenuItem.Label>Pay from</MenuItem.Label>
          <MenuItem.Caption>
            {/* @TODO: we need this to be the actual wallet name */}
            MetaMask •{' '}
            <EllipsizedText
              // @TODO: we need this to be the actual wallet address
              text="0x83124528b40F21882eb7D6bcDa07592f364d3856"
              sx={{ c: 'inherit', fontSize: 'inherit' }}
            />
          </MenuItem.Caption>
          <MenuItem.StatefulButtCon icon="ChevronExpand" onClick={onClose} />
        </MenuItem>

        <Options
          size="medium"
          routes={routes}
          chains={chains}
          balances={balances}
          onCardClick={onCardClick}
          onRouteClick={onRouteClick}
          showOnrampOption={showOnrampOption}
        />
      </Drawer.Content>
    </Drawer>
  );
}
