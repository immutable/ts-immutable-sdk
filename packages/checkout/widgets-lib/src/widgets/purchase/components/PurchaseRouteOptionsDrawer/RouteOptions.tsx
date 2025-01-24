import {
  Banner, Body, Divider, FramedVideo, MenuItem, MenuItemSize, Stack,
} from '@biom3/react';
import { motion } from 'framer-motion';
import { Checkout } from '@imtbl/checkout-sdk';
import { useTranslation } from 'react-i18next';
import { listVariants, listItemVariants } from '../../../../lib/animation/listAnimation';
import { Chain, RouteData } from '../../../../lib/squid/types';
import { getRemoteVideo } from '../../../../lib/utils';
import {
  DirectCryptoPayData, DirectCryptoPayOptionType, FiatOptionType, SquidRouteOptionType,
} from '../../types';
import { RouteOption } from './RouteOption';
import { FiatOption } from './FiatOption';
import { DirectCryptoPayOption } from './DirectCryptoPayOption';

const defaultFiatOptions: FiatOptionType[] = [
  FiatOptionType.DEBIT,
  FiatOptionType.CREDIT,
];

export interface OptionsProps {
  checkout: Checkout;
  chains: Chain[] | null;
  onCardClick: (type: FiatOptionType) => void;
  onRouteClick: (route: RouteData, index: number) => void;
  onDirectCryptoPayClick: (route: DirectCryptoPayData, index: number) => void;
  routes?: RouteData[];
  size?: MenuItemSize;
  showOnrampOption?: boolean;
  showDirectCryptoPayOption?: boolean;
  insufficientBalance?: boolean;
  selectedIndex: number;
  selectedRouteType: SquidRouteOptionType | DirectCryptoPayOptionType | undefined;
  directCryptoPayRoutes?: DirectCryptoPayData[];
}

export function RouteOptions({
  checkout,
  routes,
  chains,
  onCardClick,
  onRouteClick,
  onDirectCryptoPayClick,
  size,
  showOnrampOption,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showDirectCryptoPayOption,
  insufficientBalance,
  selectedIndex,
  selectedRouteType,
  directCryptoPayRoutes,
}: OptionsProps) {
  const { t } = useTranslation();

  const renderLoading = () => (
    <Stack
      sx={{ pt: 'base.spacing.x3' }}
      alignItems="stretch"
      gap="base.spacing.x1"
    >
      <MenuItem shimmer="withBottomSlot" size="small" emphasized />
      <MenuItem shimmer="withBottomSlot" size="small" emphasized />

      <Body sx={{ textAlign: 'center', mt: 'base.spacing.x6' }} size="small">
        {t('views.PURCHASE.drawer.options.loadingText1')}
        <br />
        {t('views.PURCHASE.drawer.options.loadingText2')}
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
      {(directCryptoPayRoutes && directCryptoPayRoutes.length > 0)
      && (directCryptoPayRoutes?.map((routeData: DirectCryptoPayData, index) => (
        <DirectCryptoPayOption
          // eslint-disable-next-line max-len
          key={`direct-crypto-pay-option-${routeData.amountData.fromToken.chainId}-${routeData.amountData.fromToken.address}`}
          size={size}
          routeData={routeData}
          chains={chains}
          onClick={() => onDirectCryptoPayClick(routeData, index)}
          isFastest={index === 0}
          // eslint-disable-next-line max-len
          selected={index === selectedIndex && (selectedRouteType === DirectCryptoPayOptionType.IMMUTABLE_ZKEVM || !selectedRouteType)}
          rc={<motion.div variants={listItemVariants} />}
        />
      )))}

      {(routes && routes.length > 0)
      && routes?.map((routeData: RouteData, index) => (
        <RouteOption
          key={`route-option-${routeData.amountData.fromToken.chainId}-${routeData.amountData.fromToken.address}`}
          size={size}
          routeData={routeData}
          chains={chains}
          onClick={() => onRouteClick(routeData, index)}
          isFastest={index === 0}
          selected={index === selectedIndex && selectedRouteType === SquidRouteOptionType.SQUID_ROUTE}
          rc={<motion.div variants={listItemVariants} />}
        />
      ))}
      {noRoutes && (
        <Banner>
          <Banner.Icon icon="InformationCircle" />
          <Banner.Title>{t('views.PURCHASE.drawer.options.noRoutes.heading')}</Banner.Title>
          <Banner.Caption>
            {t('views.PURCHASE.drawer.options.noRoutes.caption')}
          </Banner.Caption>
        </Banner>
      )}

      {!routes?.length && !insufficientBalance && renderLoading()}

      {showOnrampOption && (
      <>
        <Divider size="xSmall" sx={{ my: 'base.spacing.x2' }}>
          {t('views.PURCHASE.drawer.options.moreOptionsDividerText')}
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
