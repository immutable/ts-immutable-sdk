import {
  Body,
  Box,
  Heading,
  Icon,
  MenuItem,
  OverflowPopoverMenu,
  PriceDisplay,
} from '@biom3/react';
import {
  BalanceItemContainerStyle,
  BalanceItemCoinBoxStyle,
  BalanceItemPriceBoxStyle,
} from './BalanceItemStyles';
import { BalanceInfo } from '../../functions/tokenBalances';
import {
  sendWalletWidgetRequestBridgeEvent,
  sendWalletWidgetRequestSwapEvent,
} from '../../WalletWidgetEvents';
import { useContext } from 'react';
import { WalletContext } from '../../context/WalletContext';
import { ChainId } from '@imtbl/checkout-sdk-web';

export interface BalanceItemProps {
  balanceInfo: BalanceInfo;
}
export const BalanceItem = (props: BalanceItemProps) => {
  const {
    walletState: { network },
  } = useContext(WalletContext);
  const { balanceInfo } = props;

  return (
    <Box
      testId={`balance-item-${balanceInfo.symbol}`}
      sx={BalanceItemContainerStyle}
    >
      <Box sx={BalanceItemCoinBoxStyle}>
        <Icon icon="Coins" sx={{ width: 'base.icon.size.300' }} />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Body>{balanceInfo.symbol}</Body>
          <Body size="small">{balanceInfo.description}</Body>
        </Box>
      </Box>
      <Box sx={BalanceItemPriceBoxStyle}>
        <PriceDisplay
          testId={`balance-item-${balanceInfo.symbol}`}
          use={Heading}
          size="xSmall"
          price={balanceInfo.balance}
          fiatAmount={`≈ USD $ -.--`}
        />
        {network && network?.chainId === ChainId.POLYGON && (
          <OverflowPopoverMenu size="small">
            <MenuItem>
              <MenuItem.Icon icon="Add"></MenuItem.Icon>
              <MenuItem.Label>{`Add ${balanceInfo.symbol}`}</MenuItem.Label>
            </MenuItem>
            <MenuItem
              onClick={() =>
                sendWalletWidgetRequestSwapEvent(balanceInfo.address, '', '')
              }
            >
              <MenuItem.Icon icon="Exchange"></MenuItem.Icon>
              <MenuItem.Label>{`Swap ${balanceInfo.symbol}`}</MenuItem.Label>
            </MenuItem>
          </OverflowPopoverMenu>
        )}
        {network && network?.chainId === ChainId.ETHEREUM && (
          <OverflowPopoverMenu>
            <MenuItem
              onClick={() =>
                sendWalletWidgetRequestBridgeEvent(balanceInfo.address, '')
              }
            >
              <MenuItem.Icon icon="Minting"></MenuItem.Icon>
              <MenuItem.Label>{`Move ${balanceInfo.symbol}`}</MenuItem.Label>
            </MenuItem>
          </OverflowPopoverMenu>
        )}
      </Box>
    </Box>
  );
};
