import { Drawer, EllipsizedText, MenuItem } from '@biom3/react';
import { motion } from 'framer-motion';
import { useContext } from 'react';

import { listVariants } from '../../../lib/animation/listAnimation';
import { Options } from './Options';
import { FiatOptionType, RouteData } from '../types';
import { AddFundsContext } from '../context/AddFundsContext';
import { useProvidersContext } from '../../../context/providers-context/ProvidersContext';

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

  const {
    providersState: { fromProviderInfo, fromAddress },
  } = useProvidersContext();

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
            padded
            emphasized
            use={
              <img src={fromProviderInfo?.icon} alt={fromProviderInfo?.name} />
            }
          />
          <MenuItem.Label>Pay from</MenuItem.Label>
          <MenuItem.Caption>
            {fromProviderInfo?.name}
            {' • '}
            <EllipsizedText
              text={fromAddress ?? ''}
              sx={{ c: 'inherit', fontSize: 'inherit' }}
            />
          </MenuItem.Caption>
          <MenuItem.StatefulButtCon icon="ChevronExpand" onClick={onClose} />
        </MenuItem>
        <Options
          size="small"
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
