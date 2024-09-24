import { Box, Drawer } from '@biom3/react';
import { motion } from 'framer-motion';
import { useContext } from 'react';
import { listVariants } from '../../../lib/animation/listAnimation';
import { Options } from './Options';
import { FiatOptionType, RouteData } from '../types';
import { AddFundsContext } from '../context/AddFundsContext';

type OptionsDrawerProps = {
  routes: RouteData[];
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
    addFundsState: { chains },
  } = useContext(AddFundsContext);

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
            size="medium"
            routes={routes}
            chains={chains}
            onCardClick={onCardClick}
            onRouteClick={(route:RouteData) => { console.log('OptionsDrawer onClick'); onRouteClick(route); }}
            showOnrampOption={showOnrampOption}
          />
        </Box>
      </Drawer.Content>
    </Drawer>
  );
}
