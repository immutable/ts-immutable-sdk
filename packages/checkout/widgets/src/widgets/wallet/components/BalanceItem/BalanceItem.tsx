import {
  Body,
  Box,
  Heading,
  Icon,
  MenuItem,
  OverflowPopoverMenu,
  PriceDisplay,
} from '@biom3/react';
import { BalanceItemContainerStyles } from './BalanceItemStyles';
import { BalanceInfo } from '../../functions/tokenBalances';

export interface BalanceItemProps {
  balanceInfo: BalanceInfo;
}
export const BalanceItem = (props: BalanceItemProps) => {
  const { balanceInfo } = props;
  return (
    <Box
      testId={`balance-item-${balanceInfo.symbol}`}
      sx={BalanceItemContainerStyles}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          columnGap: 'base.spacing.x5',
        }}
      >
        <Icon icon="Dollar" sx={{ width: 'base.icon.size.300' }} />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Body>{balanceInfo.symbol}</Body>
          <Body size="small">{balanceInfo.description}</Body>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          columnGap: 'base.spacing.x4',
        }}
      >
        <PriceDisplay
          testId={`balance-item-${balanceInfo.symbol}`}
          use={Heading}
          size="xSmall"
          price={balanceInfo.balance}
          fiatAmount={`≈ USD $ -.--`}
        />
        <OverflowPopoverMenu size="small">
          <MenuItem>
            <MenuItem.Icon icon="Add"></MenuItem.Icon>
            <MenuItem.Label>{`Add ${balanceInfo.symbol}`}</MenuItem.Label>
          </MenuItem>
          <MenuItem>
            <MenuItem.Icon icon="Exchange"></MenuItem.Icon>
            <MenuItem.Label>{`Swap ${balanceInfo.symbol}`}</MenuItem.Label>
          </MenuItem>
        </OverflowPopoverMenu>
      </Box>
    </Box>
  );
};
