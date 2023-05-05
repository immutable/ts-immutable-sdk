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
  ShowMenuItem,
} from './BalanceItemStyles';
import { BalanceInfo } from '../../functions/tokenBalances';
import { WalletContext } from '../../context/WalletContext';
import { useContext, useEffect, useState } from 'react';
import { ChainId } from '@imtbl/checkout-sdk';

export interface BalanceItemProps {
  balanceInfo: BalanceInfo;
}
export const BalanceItem = (props: BalanceItemProps) => {
  const { balanceInfo } = props;
  const { walletState } = useContext(WalletContext);
  const { supportedTopUps, network } = walletState;
  const [isAddCoinEnabled, setIsAddCoinEnabled] = useState<boolean>();
  const [isMoveCoinEnabled, setIsMoveCoinEnabled] = useState<boolean>();
  const [isSwapCoinEnabled, setIsSwapCoinEnabled] = useState<boolean>();

  useEffect(() => {
    if (!network || !supportedTopUps) return;

    const enableAddCoin =
      network.chainId === ChainId.POLYGON &&
      (supportedTopUps?.isOnRampEnabled ?? true);
    setIsAddCoinEnabled(enableAddCoin);

    const enableMoveCoin =
      network.chainId === ChainId.ETHEREUM &&
      (supportedTopUps?.isBridgeEnabled ?? true);
    setIsMoveCoinEnabled(enableMoveCoin);

    const enableSwapCoin =
      network.chainId === ChainId.POLYGON &&
      (supportedTopUps?.isExchangeEnabled ?? true);
    setIsSwapCoinEnabled(enableSwapCoin);
  }, [network, supportedTopUps]);

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
        <OverflowPopoverMenu size="small">
          <MenuItem sx={ShowMenuItem(isAddCoinEnabled)}>
            <MenuItem.Icon icon="Add"></MenuItem.Icon>
            <MenuItem.Label>{`Add ${balanceInfo.symbol}`}</MenuItem.Label>
          </MenuItem>
          <MenuItem sx={ShowMenuItem(isSwapCoinEnabled)}>
            <MenuItem.Icon icon="Exchange"></MenuItem.Icon>
            <MenuItem.Label>{`Swap ${balanceInfo.symbol}`}</MenuItem.Label>
          </MenuItem>
          <MenuItem sx={ShowMenuItem(isMoveCoinEnabled)}>
            <MenuItem.Icon icon="Minting"></MenuItem.Icon>
            <MenuItem.Label>{`Move ${balanceInfo.symbol}`}</MenuItem.Label>
          </MenuItem>
        </OverflowPopoverMenu>
      </Box>
    </Box>
  );
};
