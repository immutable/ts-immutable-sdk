import {
  Drawer, EllipsizedText, MenuItem,
} from '@biom3/react';
import { motion } from 'framer-motion';
import {
  useContext, useEffect, useRef, useState,
} from 'react';
import { Checkout } from '@imtbl/checkout-sdk';
import { useAnalytics, UserJourney } from '../../../../context/analytics-provider/SegmentAnalyticsProvider';
import { useProvidersContext } from '../../../../context/providers-context/ProvidersContext';
import { listVariants } from '../../../../lib/animation/listAnimation';
import { Chain, RouteData } from '../../../../lib/squid/types';
import {
  DirectCryptoPayData, DirectCryptoPayOptionType, FiatOptionType, SquidRouteOptionType,
} from '../../types';
import { RouteOptions } from './RouteOptions';
import { PurchaseContext } from '../../context/PurchaseContext';

type OptionsDrawerProps = {
  checkout: Checkout;
  routes: RouteData[] | undefined;
  chains: Chain[] | null;
  visible: boolean;
  onClose: () => void;
  onRouteClick: (route: RouteData) => void;
  onCardClick: (type: FiatOptionType) => void;
  onDirectCryptoPayClick: (route: DirectCryptoPayData) => void;
  onChangeWalletClick: () => void;
  showOnrampOption?: boolean;
  showDirectCryptoPayOption?: boolean;
  showSwapOption?: boolean;
  showBridgeOption?: boolean;
  insufficientBalance?: boolean;
  directCryptoPayRoutes?: DirectCryptoPayData[];
};

export function RouteOptionsDrawer({
  checkout,
  routes,
  chains,
  visible,
  onClose,
  onRouteClick,
  onCardClick,
  onDirectCryptoPayClick,
  onChangeWalletClick,
  showOnrampOption,
  showDirectCryptoPayOption,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showSwapOption,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showBridgeOption,
  insufficientBalance,
  directCryptoPayRoutes,
}: OptionsDrawerProps) {
  const { track } = useAnalytics();

  const {
    purchaseState: { id },
  } = useContext(PurchaseContext);

  const {
    providersState: { fromProviderInfo, fromAddress },
  } = useProvidersContext();

  const selectedRouteIndex = useRef<number>(0);
  // eslint-disable-next-line max-len
  const [selectedRouteType, setSelectedRouteType] = useState<SquidRouteOptionType | DirectCryptoPayOptionType | undefined>(undefined);

  const handleOnRouteClick = (route: RouteData, index: number) => {
    selectedRouteIndex.current = index;
    setSelectedRouteType(SquidRouteOptionType.SQUID_ROUTE);
    onRouteClick(route);
  };

  const handleOnDirectCryptoPayClick = (route: DirectCryptoPayData, index: number) => {
    selectedRouteIndex.current = index;
    setSelectedRouteType(DirectCryptoPayOptionType.IMMUTABLE_ZKEVM);
    onDirectCryptoPayClick(route);
  };

  const handleOnChangeWalletClick = () => {
    onClose();
    onChangeWalletClick();
  };

  useEffect(() => {
    if (!visible) {
      return;
    }

    track({
      userJourney: UserJourney.PURCHASE,
      screen: 'InputScreen',
      control: 'RoutesMenu',
      controlType: 'MenuItem',
      action: 'Opened',
      extras: {
        contextId: id,
        showOnrampOption: Boolean(showOnrampOption),
        showSwapOption: Boolean(showSwapOption),
        insufficientBalance: Boolean(insufficientBalance),
        routesAvailable: routes?.length ?? 0,
      },
    });
  }, [visible]);

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
            use={(
              <img src={fromProviderInfo?.icon} alt={fromProviderInfo?.name} />
            )}
            sx={{ mx: 'base.spacing.x2' }}
          />
          <MenuItem.Label>
            {fromProviderInfo?.name}
          </MenuItem.Label>
          <MenuItem.Caption>
            <EllipsizedText
              text={fromAddress ?? ''}
              sx={{ c: 'inherit', fontSize: 'inherit' }}
            />
          </MenuItem.Caption>
          <MenuItem.StatefulButtCon icon="ChevronExpand" onClick={onClose} />
        </MenuItem>
        <RouteOptions
          size="small"
          checkout={checkout}
          routes={routes}
          chains={chains}
          onCardClick={onCardClick}
          onRouteClick={handleOnRouteClick}
          onDirectCryptoPayClick={handleOnDirectCryptoPayClick}
          onChangeWalletClick={handleOnChangeWalletClick}
          showOnrampOption={showOnrampOption}
          showDirectCryptoPayOption={showDirectCryptoPayOption}
          insufficientBalance={insufficientBalance}
          selectedIndex={selectedRouteIndex.current}
          selectedRouteType={selectedRouteType}
          directCryptoPayRoutes={directCryptoPayRoutes}
        />
      </Drawer.Content>
    </Drawer>
  );
}
