import { Box, LoadingOverlay, MenuItemSize } from '@biom3/react';
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
  if (!routes) {
    return (
      <LoadingOverlay visible>
        <LoadingOverlay.Content>
          <LoadingOverlay.Content.LoopingText
            text={['Fetching balances', 'Fetching routes']}
            textDuration={5000}
          />
        </LoadingOverlay.Content>
      </LoadingOverlay>
    );
  }

  const routeOptions = routes.map((route: RouteData) => {
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
    <Box
      testId="options-list"
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
      rc={
        <motion.div variants={listVariants} initial="hidden" animate="show" />
      }
    >
      {routeOptions}
      {fiatOptions}
    </Box>
  );
}
