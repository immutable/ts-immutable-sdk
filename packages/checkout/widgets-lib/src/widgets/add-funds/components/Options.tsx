import {
  Body,
  FramedVideo,
  MenuItem,
  Stack,
  MenuItemSize,
  Divider,
  Banner,
} from '@biom3/react';
import { motion } from 'framer-motion';
import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { useMemo } from 'react';
import {
  listItemVariants,
  listVariants,
} from '../../../lib/animation/listAnimation';
import { FiatOption } from './FiatOption';
import { Chain, FiatOptionType, RouteData } from '../types';
import { RouteOption } from './RouteOption';
import { getUsdBalance } from '../functions/convertTokenBalanceToUsd';

const defaultFiatOptions: FiatOptionType[] = [
  FiatOptionType.DEBIT,
  FiatOptionType.CREDIT,
];

export interface OptionsProps {
  chains: Chain[] | null;
  balances: TokenBalance[] | null;
  onCardClick: (type: FiatOptionType) => void;
  onRouteClick: (route: RouteData, index: number) => void;
  routes?: RouteData[];
  size?: MenuItemSize;
  showOnrampOption?: boolean;
  insufficientBalance?: boolean;
  selectedIndex: number;
}

export function Options({
  routes,
  chains,
  balances,
  onCardClick,
  onRouteClick,
  size,
  showOnrampOption,
  insufficientBalance,
  selectedIndex,
}: OptionsProps) {
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
          Finding the best value
          <br />
          across all chains
        </Body>
        <FramedVideo
          mimeType="video/mp4"
          videoUrl="https://i.imgur.com/dVQoobw.mp4"
          sx={{ alignSelf: 'center', mt: 'base.spacing.x2' }}
          size="large"
          circularFrame
        />
      </Stack>
    );
  }

  const routeOptions = routes?.map((route: RouteData, index) => {
    const { fromToken } = route.amountData;

    const chain = chains?.find((c) => c.id === fromToken.chainId);
    const balance = balances?.find(
      (bal) => bal.address === fromToken.address && bal.chainId === fromToken.chainId,
    );

    const usdBalance = getUsdBalance(balance, route);

    return (
      <RouteOption
        key={`route-option-${fromToken.chainId}-${fromToken.address}`}
        chain={chain}
        route={route}
        usdBalance={usdBalance}
        onClick={() => onRouteClick(route, index)}
        size={size}
        rc={<motion.div variants={listItemVariants} />}
        isFastest={index === 0}
        selected={index === selectedIndex}
      />
    );
  });

  const fiatOptions = useMemo(() => {
    if (!showOnrampOption) return null;

    return (
      <>
        <Divider size="xSmall" sx={{ my: 'base.spacing.x2' }}>
          More ways to Pay
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
    );
  }, [showOnrampOption, size, onCardClick]);

  const noFundsBanner = useMemo(() => {
    if (!insufficientBalance || routes?.length) return null;

    return (
      <Banner>
        <Banner.Icon icon="InformationCircle" />
        <Banner.Title>No routes found</Banner.Title>
        <Banner.Caption>
          Choose a different wallet, token or amount and try again.
        </Banner.Caption>
      </Banner>
    );
  }, [insufficientBalance, routes]);

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
      {routeOptions}
      {noFundsBanner}
      {fiatOptions}
    </Stack>
  );
}
