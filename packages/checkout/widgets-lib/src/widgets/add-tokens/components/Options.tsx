import {
  Banner, Body, Divider, FramedVideo, MenuItem, MenuItemSize, Stack,
} from '@biom3/react';
import { motion } from 'framer-motion';
import { Checkout } from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { listItemVariants, listVariants } from '../../../lib/animation/listAnimation';
import { FiatOption } from './FiatOption';
import { Chain, FiatOptionType, RouteData } from '../types';
import { RouteOption } from './RouteOption';
import { getRemoteVideo } from '../../../lib/utils';

const defaultFiatOptions: FiatOptionType[] = [
  FiatOptionType.DEBIT,
  FiatOptionType.CREDIT,
];

export interface OptionsProps {
  checkout: Checkout;
  chains: Chain[] | null;
  onCardClick: (type: FiatOptionType) => void;
  onRouteClick: (route: RouteData, index: number) => void;
  routes?: RouteData[];
  size?: MenuItemSize;
  showOnrampOption?: boolean;
  insufficientBalance?: boolean;
  selectedIndex: number;
}

export function Options({
  checkout,
  routes,
  chains,
  onCardClick,
  onRouteClick,
  size,
  showOnrampOption,
  insufficientBalance,
  selectedIndex,
}: OptionsProps) {
  const { t } = useTranslation();

  // @NOTE: early exit with loading related UI, when the
  // routes are not yet available
  if (!routes?.length && !insufficientBalance) {
    return (
      <Stack
        sx={{ pt: 'base.spacing.x3' }}
        alignItems="stretch"
        gap="base.spacing.x1"
      >
        <MenuItem shimmer="withBottomSlot" size="small" emphasized />
        <MenuItem shimmer="withBottomSlot" size="small" emphasized />

        <Body sx={{ textAlign: 'center', mt: 'base.spacing.x6' }} size="small">
          {t('views.ADD_TOKENS.drawer.options.loadingText1')}
          <br />
          {t('views.ADD_TOKENS.drawer.options.loadingText2')}
        </Body>
        <FramedVideo
          mimeType="video/mp4"
          videoUrl={getRemoteVideo(
            checkout.config.environment,
            '/loading_bubble-small.mp4',
          )}
          sx={{ alignSelf: 'center', mt: 'base.spacing.x2' }}
          size="large"
          circularFrame
        />
      </Stack>
    );
  }
  const noRoutes = !(!insufficientBalance || routes?.length);

  return (
    <Stack
      sx={{ py: 'base.spacing.x3' }}
      alignItems="stretch"
      gap="base.spacing.x1"
      testId="options-list"
      justifyContent="center"
      rc={
        <motion.div variants={listVariants} initial="hidden" animate="show" />
      }
    >
      {routes?.map((routeData: RouteData, index) => (
        <RouteOption
          key={`route-option-${routeData.amountData.fromToken.chainId}-${routeData.amountData.fromToken.address}`}
          size={size}
          routeData={routeData}
          chains={chains}
          onClick={() => onRouteClick(routeData, index)}
          isFastest={index === 0}
          selected={index === selectedIndex}
          rc={<motion.div variants={listItemVariants} />}
        />
      ))}
      {noRoutes && (
        <Banner>
          <Banner.Icon icon="InformationCircle" />
          <Banner.Title>{t('views.ADD_TOKENS.drawer.options.noRoutes.heading')}</Banner.Title>
          <Banner.Caption>
            {t('views.ADD_TOKENS.drawer.options.noRoutes.caption')}
          </Banner.Caption>
        </Banner>
      )}
      {showOnrampOption && (
      <>
        <Divider size="xSmall" sx={{ my: 'base.spacing.x2' }}>
          {t('views.ADD_TOKENS.drawer.options.moreOptionsDividerText')}
        </Divider>
        {defaultFiatOptions.map((type, idx) => (
          <FiatOption
            key={`fiat-option-${type}`}
            type={type}
            size={size}
            onClick={onCardClick}
            rc={<motion.div custom={idx} variants={listItemVariants} />}
          />
        ))}
      </>
      )}
    </Stack>
  );
}
