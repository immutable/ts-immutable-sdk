import { Box, MenuItemSize } from '@biom3/react';

import { motion } from 'framer-motion';
import {
  listItemVariants,
  listVariants,
} from '../../../lib/animation/listAnimation';
import { FiatOption } from './FiatOption';
import { Chain, FiatOptionType, RouteData } from '../types';
import { RouteOption } from './RouteOption';

const defaultOptions: FiatOptionType[] = [
  FiatOptionType.DEBIT,
  FiatOptionType.CREDIT,
];

export interface OptionsProps {
  routes: RouteData[];
  chains: Chain[];
  onCardClick: (type: FiatOptionType) => void;
  onRouteClick: (route: RouteData) => void;
  size?: MenuItemSize;
  showOnrampOption?: boolean;
}

export function Options(props: OptionsProps) {
  const {
    routes,
    chains,
    onCardClick,
    onRouteClick,
    size,
    showOnrampOption,
  } = props;
  const disabledOptions: FiatOptionType[] = [];

  if (!showOnrampOption) {
    disabledOptions.push(FiatOptionType.CREDIT);
    disabledOptions.push(FiatOptionType.DEBIT);
  }

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
      {routes.length > 0 && routes.map((route: RouteData) => {
        const chain = chains.find((c: Chain) => c.id === route.amountData.fromToken.chainId);
        return (
          <RouteOption
            key={`route-option-${route.amountData.fromToken.chainId}-${route.amountData.fromToken.address}`}
            chain={chain}
            route={route}
            onClick={() => onRouteClick(route)}
            size={size}
            disabled={false}
            rc={<motion.div variants={listItemVariants} />}
          />
        );
      })}

      {showOnrampOption && defaultOptions.map((type, idx: number) => (
        <FiatOption
          key={`fiat-option-type-${type}`}
          type={type}
          size={size}
          onClick={() => onCardClick(type)}
          rc={<motion.div custom={idx} variants={listItemVariants} />}
        />
      ))}
    </Box>
  );
}
