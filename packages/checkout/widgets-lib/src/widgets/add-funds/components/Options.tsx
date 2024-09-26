import { Body, Box, MenuItemSize } from '@biom3/react';

import { motion } from 'framer-motion';
import { TokenBalance } from '@0xsquid/sdk/dist/types';
import {
  listItemVariants,
  listVariants,
} from '../../../lib/animation/listAnimation';
import { FiatOption } from './FiatOption';
import { Chain, FiatOptionType, RouteData } from '../types';
import { RouteOption } from './RouteOption';
import { convertTokenBalanceToUsd } from '../functions/convertTokenBalanceToUsd';

const defaultFiatOptions: FiatOptionType[] = [
  FiatOptionType.DEBIT,
  FiatOptionType.CREDIT,
];

export interface OptionsProps {
  chains: Chain[] | null;
  balances: TokenBalance[] | null;
  onCardClick?: (type: FiatOptionType) => void;
  onRouteClick?: (route: RouteData) => void;
  routes?: RouteData[];
  size?: MenuItemSize;
  showOnrampOption?: boolean;
}

export function Options(props: OptionsProps) {
  const {
    routes,
    chains,
    balances,
    onCardClick,
    onRouteClick,
    size,
    showOnrampOption,
  } = props;

  const getUsdBalance = (balance: TokenBalance | undefined, route: RouteData) => {
    if (!balance) return undefined;

    try {
      return convertTokenBalanceToUsd(balance, route.route)?.toString();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error calculating USD balance:', error);
      return undefined;
    }
  };

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
      {!routes && <Body>Loading...</Body>}

      {routes?.map((route: RouteData) => {
        const { fromToken } = route.amountData;

        const chain = chains?.find((c) => c.id === fromToken.chainId);

        const balance = balances?.find(
          (bal) => bal.address === fromToken.address && bal.chainId === fromToken.chainId,
        );

        const usdBalance = getUsdBalance(balance, route);
        return (
          <RouteOption
            key={`route-option-${route.amountData.fromToken.chainId}-${route.amountData.fromToken.address}`}
            chain={chain}
            route={route}
            usdBalance={usdBalance}
            onClick={onRouteClick}
            size={size}
            rc={<motion.div variants={listItemVariants} />}
          />
        );
      })}

      {showOnrampOption && defaultFiatOptions.map((type, idx: number) => (
        <FiatOption
          key={`fiat-option-${type}`}
          type={type}
          size={size}
          onClick={onCardClick}
          rc={<motion.div custom={idx} variants={listItemVariants} />}
        />
      ))}
    </Box>
  );
}
