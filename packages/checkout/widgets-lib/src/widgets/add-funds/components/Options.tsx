import {
  Body,
  FramedVideo,
  MenuItem,
  Stack,
  MenuItemSize,
  Divider,
} from '@biom3/react';
import { motion } from 'framer-motion';
import { TokenBalance } from '@0xsquid/sdk/dist/types';
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
  onRouteClick: (route: RouteData) => void;
  routes?: RouteData[];
  size?: MenuItemSize;
  showOnrampOption?: boolean;
}

export function Options({
  routes,
  chains,
  balances,
  onCardClick,
  onRouteClick,
  size,
  showOnrampOption,
}: OptionsProps) {
  // @NOTE: early exit with loading related UI, when the
  // routes are not yet available
  if (!routes?.length) {
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
          padded
          circularFrame
        />
      </Stack>
    );
  }

  const routeOptions = routes.map((route: RouteData, index) => {
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
        onClick={onRouteClick}
        size={size}
        rc={<motion.div variants={listItemVariants} />}
        isFastest={index === 0}
      />
    );
  });

  const fiatOptions = showOnrampOption
    ? defaultFiatOptions.map((type, idx) => (
      <FiatOption
        key={`fiat-option-${type}`}
        type={type}
        size={size}
        onClick={onCardClick}
        rc={<motion.div custom={idx} variants={listItemVariants} />}
      />
    ))
    : null;

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
      <Divider size="xSmall" sx={{ my: 'base.spacing.x2' }}>
        More ways to Pay
      </Divider>
      {fiatOptions}
    </Stack>
  );
}
