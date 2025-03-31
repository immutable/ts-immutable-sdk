import {
  Drawer, EllipsizedText, MenuItem,
} from '@biom3/react';
import { motion } from 'framer-motion';
import { useContext, useEffect, useRef } from 'react';

import { Checkout } from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { useAnalytics, UserJourney } from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { useProvidersContext } from '../../context/providers-context/ProvidersContext';
import { listVariants } from '../../lib/animation/listAnimation';
import { RouteData } from '../../lib/squid/types';
import { AddTokensContext } from '../../widgets/add-tokens/context/AddTokensContext';
import { FiatOptionType } from '../../widgets/add-tokens/types';
import { RouteOptions } from './RouteOptions';

type OptionsDrawerProps = {
  checkout: Checkout;
  routes: RouteData[] | undefined;
  visible: boolean;
  onClose: () => void;
  onRouteClick: (route: RouteData) => void;
  onCardClick: (type: FiatOptionType) => void;
  showOnrampOption?: boolean;
  showSwapOption?: boolean;
  showBridgeOption?: boolean;
  insufficientBalance?: boolean;
};

export function RouteOptionsDrawer({
  checkout,
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
  insufficientBalance,
}: OptionsDrawerProps) {
  const { t } = useTranslation();
  const { track } = useAnalytics();

  const {
    addTokensState: { id, chains },
  } = useContext(AddTokensContext);

  const {
    providersState: { fromProviderInfo, fromAddress },
  } = useProvidersContext();

  const selectedRouteIndex = useRef<number>(0);

  const handleOnRouteClick = (route: RouteData, index: number) => {
    selectedRouteIndex.current = index;
    onRouteClick(route);
  };

  useEffect(() => {
    if (!visible) {
      return;
    }

    track({
      userJourney: UserJourney.ADD_TOKENS,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <MenuItem.Label>{t('views.ADD_TOKENS.drawer.options.heading')}</MenuItem.Label>
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
        <RouteOptions
          size="small"
          checkout={checkout}
          routes={routes}
          chains={chains}
          onCardClick={onCardClick}
          onRouteClick={handleOnRouteClick}
          showOnrampOption={showOnrampOption}
          insufficientBalance={insufficientBalance}
          selectedIndex={selectedRouteIndex.current}
        />
      </Drawer.Content>
    </Drawer>
  );
}
